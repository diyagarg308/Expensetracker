import { useState, useEffect, useCallback } from "react";
import { useDebounce } from "../hooks/useDebounce";
import { sound } from "../utils/sound";

export function GitHubExplorer() {
  const [searchTerm, setSearchTerm] = useState("facebook");
  const debouncedUser = useDebounce(searchTerm, 600);

  const [profile, setProfile] = useState(null);
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reposLoading, setReposLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMoreRepos, setHasMoreRepos] = useState(true);

  // Fetch GitHub User Profile
  const fetchUserProfile = useCallback(async (username) => {
    if (!username.trim()) return;
    setLoading(true);
    setError(null);
    setPage(1);

    try {
      const res = await fetch(`https://api.github.com/users/${encodeURIComponent(username.trim())}`);
      if (!res.ok) {
        if (res.status === 404) throw new Error(`User "${username}" not found on GitHub.`);
        if (res.status === 403) throw new Error("GitHub API rate limit reached. Please retry in a few moments.");
        throw new Error(`GitHub API returned status ${res.status}.`);
      }
      const data = await res.json();
      setProfile(data);
      sound.playCoin();
    } catch (err) {
      setError(err.message || "Failed to fetch user data.");
      setProfile(null);
      setRepos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch Repositories with pagination
  const fetchUserRepos = useCallback(async (username, pageNum = 1, append = false) => {
    if (!username.trim()) return;
    setReposLoading(true);

    try {
      const res = await fetch(
        `https://api.github.com/users/${encodeURIComponent(username.trim())}/repos?per_page=6&page=${pageNum}&sort=updated`
      );
      if (!res.ok) throw new Error("Failed to load repositories.");
      const repoList = await res.json();

      if (append) {
        setRepos(prev => [...prev, ...repoList]);
      } else {
        setRepos(repoList);
      }

      setHasMoreRepos(repoList.length === 6);
    } catch {
      // Repos loading error handled gracefully
    } finally {
      setReposLoading(false);
    }
  }, []);

  // Effect to trigger search when debounced user changes
  useEffect(() => {
    if (!debouncedUser) return;
    let isMounted = true;

    async function loadData() {
      if (isMounted) {
        await fetchUserProfile(debouncedUser);
        await fetchUserRepos(debouncedUser, 1, false);
      }
    }
    loadData();

    return () => {
      isMounted = false;
    };
  }, [debouncedUser, fetchUserProfile, fetchUserRepos]);

  // Load more repos (Pagination)
  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    sound.playPowerup();
    fetchUserRepos(debouncedUser, nextPage, true);
  };

  return (
    <div className="page github-explorer-page">
      {/* Header HUD */}
      <div className="page-header game-header-bar">
        <div>
          <div className="eyebrow game-eyebrow">
            <span className="game-star">📡</span>
            MINI PROJECT: REST API WITH FETCH & DEBOUNCE
          </div>
          <h1>GitHub REST API Profile & Repo Explorer</h1>
          <p>Consumes public REST endpoints with debounce rate-limiting, loading states, error boundaries, and pagination.</p>
        </div>

        <div className="api-preset-chips">
          <span className="preset-label">Quick Queries:</span>
          {["facebook", "vercel", "shadcn", "torvalds"].map(name => (
            <button
              key={name}
              className="preset-user-chip"
              onClick={() => {
                setSearchTerm(name);
                sound.playCoin();
              }}
            >
              @{name}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input with Debounce */}
      <div className="api-search-panel">
        <div className="api-search-box">
          <span className="api-search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search any GitHub username (e.g. facebook, gaearon, octocat)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="api-search-input"
          />
          {searchTerm && (
            <button className="clear-api-btn" onClick={() => setSearchTerm("")}>✕</button>
          )}
        </div>
        <span className="debounce-indicator-tag">
          ⚡ 600ms Debounce Active
        </span>
      </div>

      {/* Loading State Skeleton */}
      {loading && (
        <div className="api-loading-skeleton">
          <div className="skeleton-avatar"></div>
          <div className="skeleton-details">
            <div className="skeleton-line title"></div>
            <div className="skeleton-line text"></div>
            <div className="skeleton-line chips"></div>
          </div>
        </div>
      )}

      {/* Error Boundary with Retry */}
      {!loading && error && (
        <div className="api-error-card">
          <span className="error-icon-lg">⚠️</span>
          <h3>REST API Request Failed</h3>
          <p>{error}</p>
          <button
            className="api-retry-btn"
            onClick={() => {
              sound.playHit();
              fetchUserProfile(searchTerm);
              fetchUserRepos(searchTerm, 1, false);
            }}
          >
            <span>🔄 Retry Request</span>
          </button>
        </div>
      )}

      {/* Profile & Repos Showcase */}
      {!loading && !error && profile && (
        <div className="api-results-layout">
          {/* User Profile Card */}
          <div className="profile-identity-card">
            <div className="profile-avatar-zone">
              <img
                src={profile.avatar_url}
                alt={profile.login}
                className="github-avatar-img"
              />
              <span className="profile-type-badge">{profile.type}</span>
            </div>

            <div className="profile-main-bio">
              <h2>{profile.name || profile.login}</h2>
              <span className="profile-handle">@{profile.login}</span>
              {profile.bio && <p className="profile-bio-text">{profile.bio}</p>}

              <div className="profile-meta-pills">
                {profile.location && <span>📍 {profile.location}</span>}
                {profile.company && <span>🏢 {profile.company}</span>}
                {profile.blog && (
                  <a href={profile.blog.startsWith("http") ? profile.blog : `https://${profile.blog}`} target="_blank" rel="noreferrer" className="blog-link">
                    🔗 {profile.blog}
                  </a>
                )}
              </div>
            </div>

            <div className="profile-counters-grid">
              <div className="counter-box">
                <small>FOLLOWERS</small>
                <strong>{profile.followers?.toLocaleString()}</strong>
              </div>
              <div className="counter-box">
                <small>FOLLOWING</small>
                <strong>{profile.following?.toLocaleString()}</strong>
              </div>
              <div className="counter-box">
                <small>PUBLIC REPOS</small>
                <strong>{profile.public_repos?.toLocaleString()}</strong>
              </div>
            </div>

            <a
              href={profile.html_url}
              target="_blank"
              rel="noreferrer"
              className="view-github-profile-btn"
            >
              <span>View on GitHub.com</span>
              <span>↗</span>
            </a>
          </div>

          {/* Repositories Grid with Pagination */}
          <div className="repos-container-zone">
            <div className="repos-header-row">
              <h3>Public Repositories ({repos.length} loaded)</h3>
              <span className="repos-sort-badge">Sorted by: Recently Updated</span>
            </div>

            <div className="repos-cards-grid">
              {repos.map(repo => (
                <div className="repo-card-item" key={repo.id}>
                  <div className="repo-card-top">
                    <h4>
                      <a href={repo.html_url} target="_blank" rel="noreferrer">
                        {repo.name}
                      </a>
                    </h4>
                    <span className="repo-visibility-pill">{repo.visibility}</span>
                  </div>

                  <p className="repo-desc">
                    {repo.description || "No public repository description provided."}
                  </p>

                  <div className="repo-card-meta">
                    {repo.language && (
                      <span className="repo-lang-tag">
                        <span className="lang-bullet">●</span>
                        <span>{repo.language}</span>
                      </span>
                    )}
                    <span className="repo-stat-chip">⭐ {repo.stargazers_count}</span>
                    <span className="repo-stat-chip">🍴 {repo.forks_count}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination / Load More */}
            {hasMoreRepos && (
              <div className="load-more-repos-bar">
                <button
                  className="load-more-btn"
                  onClick={handleLoadMore}
                  disabled={reposLoading}
                >
                  {reposLoading ? "Fetching Next Page..." : "↓ Load More Repositories (Page " + (page + 1) + ")"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
