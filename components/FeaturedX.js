'use client';

import { useEffect, useRef } from 'react';
import { featuredXPosts, links } from '../config/site';

// Curated, never a live timeline: only the URLs listed in config/site.js render.
// If the list is empty the whole section is absent — an empty shelf says nothing
// worth saying on a launch page.

function handleOf(url) {
  const m = /(?:x|twitter)\.com\/([^/]+)\/status/i.exec(url);
  return m ? `@${m[1]}` : 'x.com';
}

export default function FeaturedX() {
  const ref = useRef(null);

  useEffect(() => {
    if (featuredXPosts.length === 0) return;

    const render = () => window.twttr?.widgets?.load?.(ref.current);

    if (window.twttr?.widgets) {
      render();
      return;
    }
    const existing = document.getElementById('twitter-wjs');
    if (existing) {
      existing.addEventListener('load', render);
      return () => existing.removeEventListener('load', render);
    }
    const s = document.createElement('script');
    s.id = 'twitter-wjs';
    s.src = 'https://platform.twitter.com/widgets.js';
    s.async = true;
    s.charset = 'utf-8';
    s.addEventListener('load', render);
    document.body.appendChild(s);
  }, []);

  if (featuredXPosts.length === 0) return null;

  return (
    <section className="section" id="featured" style={{ '--wc': 'var(--w3)' }}>
      <div className="section-head">
        <h2>Featured on X</h2>
        <span>curated · {featuredXPosts.length} post{featuredXPosts.length === 1 ? '' : 's'}</span>
      </div>
      <p className="section-goal">
        Hand-picked write-ups only — the timeline itself is mostly seal hashes and
        pulse notes, and those live in the ledger where they can be checked.
      </p>

      <div className="xgrid" ref={ref}>
        {featuredXPosts.map((url) => (
          <div className="xcard" key={url}>
            <blockquote className="twitter-tweet" data-dnt="true">
              {/* Visible fallback if the embed script is blocked. */}
              <a href={url} target="_blank" rel="noreferrer">
                {handleOf(url)} on X ↗
              </a>
            </blockquote>
          </div>
        ))}
      </div>

      <div className="linkrow" style={{ marginTop: 12 }}>
        <a href={links.x} target="_blank" rel="noreferrer">
          latest from {links.xHandle} ↗
        </a>
      </div>
    </section>
  );
}
