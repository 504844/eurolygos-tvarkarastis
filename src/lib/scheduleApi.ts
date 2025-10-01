import { ScheduleData, Game } from '../types/schedule';

function parseGamesFromHTML(html: string): Game[] {
  const games: Game[] = [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const timetable = doc.querySelector('#timetablesDesktop');
  if (!timetable) {
    console.warn('>>> No #timetablesDesktop found in page');
    return games;
  }

  let currentDate = '';

  const children = Array.from(timetable.children);
  children.forEach((el) => {
    if (el.classList.contains('tmtb-date')) {
      // Update current date when we hit a date block
      currentDate = el.textContent?.trim() || '';
    }

    if (el.classList.contains('tmtb-row')) {
      const timeEl = el.querySelector('.tmtb-time');
      const homeTeamEl = el.querySelector('.tmtb-team-home .tmtb-team-h-name');
      const awayTeamEl = el.querySelector('.tmtb-team-away .tmtb-team-a-name');
      const leagueEl = el.querySelector('.tmtb-league');

      const homeLogoEl = el.querySelector<HTMLImageElement>('.tmtb-team-home img');
      const awayLogoEl = el.querySelector<HTMLImageElement>('.tmtb-team-away img');

      if (timeEl && homeTeamEl && awayTeamEl && leagueEl) {
        games.push({
          date: currentDate,
          time: timeEl.textContent?.trim() || '',
          homeTeam: homeTeamEl.textContent?.trim() || '',
          awayTeam: awayTeamEl.textContent?.trim() || '',
          league: leagueEl.textContent?.trim() || '',
          homeLogo: homeLogoEl ? normalizeLogoUrl(homeLogoEl.getAttribute('src')) : undefined,
          awayLogo: awayLogoEl ? normalizeLogoUrl(awayLogoEl.getAttribute('src')) : undefined,
        });
      }
    }
  });

  return games;
}

function normalizeLogoUrl(src: string | null): string | undefined {
  if (!src) return undefined;
  if (src.startsWith('http')) {
    return src; // already absolute
  }
  // prepend base domain if it's a relative path
  return `https://www.krepsinis.net${src}`;
}

function getTotalPages(html: string): number {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const pager = doc.querySelector('.league-pager .Upager');
  if (!pager) return 1;

  const pageLinks = pager.querySelectorAll('a[href*="page="]');
  if (pageLinks.length === 0) return 1;

  let maxPage = 1;
  pageLinks.forEach((link) => {
    const href = link.getAttribute('href');
    const match = href?.match(/page=(\d+)/);
    if (match) {
      maxPage = Math.max(maxPage, parseInt(match[1]));
    }
  });

  return maxPage;
}

async function fetchPageHTML(page: number): Promise<string> {
  const targetUrl = `https://www.krepsinis.net/tvarkarastis/eurolyga?page=${page}`;

  const proxies = [
    (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
    (url: string) => `https://thingproxy.freeboard.io/fetch/${url}`,
  ];

  for (const makeUrl of proxies) {
    try {
      console.log('>>> Fetching via proxy:', makeUrl(targetUrl));
      const response = await fetch(makeUrl(targetUrl), {
        headers: { 'User-Agent': 'Mozilla/5.0' },
      });
      if (response.ok) {
        const text = await response.text();
        console.log(`>>> Page ${page} fetched, length:`, text.length);
        return text;
      }
    } catch (err) {
      console.warn(`Proxy failed: ${makeUrl(targetUrl)}`, err);
    }
  }

  throw new Error(`All proxies failed for page ${page}`);
}

let cachedData: { games: Game[]; timestamp: number } | null = null;
const CACHE_DURATION = 5 * 60 * 1000;

export async function fetchSchedule(
  page: number = 1,
  fetchAll: boolean = false
): Promise<ScheduleData> {
  console.log('>>> fetchSchedule CALLED with:', { page, fetchAll });
  try {
    if (fetchAll) {
      const now = Date.now();
      if (cachedData && now - cachedData.timestamp < CACHE_DURATION) {
        console.log('>>> Returning cached data');
        return {
          games: cachedData.games,
          currentPage: 1,
          totalPages: 1,
        };
      }

      console.log(`>>> Trying to fetch page 1: https://www.krepsinis.net/tvarkarastis/eurolyga?page=1`);
      const firstPageHTML = await fetchPageHTML(1);
      const totalPages = getTotalPages(firstPageHTML);
      const firstPageGames = parseGamesFromHTML(firstPageHTML);
      console.log(`>>> Found ${firstPageGames.length} games on first page`);

      let allGames = [...firstPageGames];

      const fetchPromises = [];
      for (let p = 2; p <= totalPages; p++) {
        console.log(`>>> Trying to fetch page ${p}: https://www.krepsinis.net/tvarkarastis/eurolyga?page=${p}`);
        fetchPromises.push(fetchPageHTML(p));
      }

      const otherPagesHTML = await Promise.all(fetchPromises);

      for (const html of otherPagesHTML) {
        const games = parseGamesFromHTML(html);
        console.log(`>>> Parsed ${games.length} games from extra page`);
        allGames = allGames.concat(games);
      }

      cachedData = { games: allGames, timestamp: now };

      return {
        games: allGames,
        currentPage: 1,
        totalPages: 1,
      };
    }

    const html = await fetchPageHTML(page);
    const totalPages = getTotalPages(html);
    const games = parseGamesFromHTML(html);
    console.log(`>>> Parsed ${games.length} games on page ${page}`);

    return { games, currentPage: page, totalPages };
  } catch (error) {
    console.error('Error fetching schedule:', error);
    throw error;
  }
}
