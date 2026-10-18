import React from 'react';
import { Link } from 'react-router-dom';
import { BLOG_POSTS } from '../data/animeData';

export const BlogPage: React.FC = () => {
  return (
    <>
      {/* Normal Breadcrumb */}
      <section
        className="normal-breadcrumb set-bg"
        style={{ backgroundImage: `url(/img/normal-breadcrumb.jpg)` }}
      >
        <div className="container">
          <div className="row">
            <div className="col-lg-12 text-center">
              <div className="normal__breadcrumb__text">
                <h2>Our Blog</h2>
                <p>Welcome to the official Anime community blog & latest news.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="blog spad">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="row">
                {BLOG_POSTS.map((post) => (
                  <div key={post.id} className="col-lg-6 col-md-6 col-sm-6 mb-4">
                    <div
                      className="blog__item set-bg"
                      style={{
                        backgroundImage: `url(${post.image})`,
                        borderRadius: '5px',
                        overflow: 'hidden',
                        position: 'relative'
                      }}
                    >
                      <div className="blog__item__text">
                        <p>
                          <span className="icon_calendar"></span> {post.date} &bull; By {post.author}
                        </p>
                        <h4>
                          <Link to={`/blog/${post.id}`}>{post.title}</Link>
                        </h4>
                        <Link to={`/blog/${post.id}`} className="primary-btn mt-2">
                          Read More <span className="arrow_right"></span>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
