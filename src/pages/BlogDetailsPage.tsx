import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BLOG_POSTS, INITIAL_REVIEWS } from '../data/animeData';
import { Review } from '../types/anime';

export const BlogDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const post = BLOG_POSTS.find(p => p.id === id) || BLOG_POSTS[0];
  const [comments, setComments] = useState<Review[]>(INITIAL_REVIEWS.slice(0, 2));
  const [newComment, setNewComment] = useState('');

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setComments([
      {
        id: `com-${Date.now()}`,
        userName: 'Reader (You)',
        userAvatar: '/img/anime/review-1.jpg',
        timeAgo: 'Just now',
        comment: newComment.trim()
      },
      ...comments
    ]);
    setNewComment('');
  };

  return (
    <>
      {/* Blog Details Hero */}
      <section
        className="blog-details-hero set-bg"
        style={{ backgroundImage: `url(${post.image})`, position: 'relative' }}
      >
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="blog__details__hero__text">
                <div className="label">Anime News</div>
                <h2>{post.title}</h2>
                <ul>
                  <li>By <span>{post.author}</span></li>
                  <li><i className="fa fa-calendar"></i> {post.date}</li>
                  <li><i className="fa fa-comments"></i> {comments.length} Comments</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Details Content */}
      <section className="blog-details spad">
        <div className="container">
          <div className="row">
            <div className="col-lg-8 m-auto">
              <div className="blog__details__content">
                <div className="blog__details__text">
                  <p>{post.excerpt}</p>
                  {post.content?.map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                </div>

                <div className="blog__details__item__text">
                  <h4>Key Insights & Takeaways</h4>
                  <p>
                    The integration of artistic depth, musical composition, and dynamic storytelling
                    continues to elevate anime on the global stage. Studios are pushing technological
                    boundaries while honoring traditional 2D hand-drawn techniques that make anime truly unique.
                  </p>
                </div>

                <div className="blog__details__quote">
                  <div className="icon">
                    <span className="icon_quotations"></span>
                  </div>
                  <p>
                    “Anime is not just drawing lines, it is breathing spirit and intention into every frame.”
                  </p>
                  <span>- Studio Production Team</span>
                </div>

                <div className="blog__details__tags">
                  <a href="#">Healthfood</a>
                  <a href="#">Sport</a>
                  <a href="#">Game</a>
                </div>

                <div className="blog__details__btns">
                  <div className="row">
                    <div className="col-lg-6">
                      <div className="blog__details__btns__item">
                        <h5>
                          <Link to="/blog"><span className="arrow_left"></span> Back to all blogs</Link>
                        </h5>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Comments Section */}
                <div className="blog__details__comment">
                  <h4>{comments.length} Comments</h4>
                  {comments.map((c) => (
                    <div key={c.id} className="blog__details__comment__item">
                      <div className="blog__details__comment__item__pic">
                        <img src={c.userAvatar} alt={c.userName} />
                      </div>
                      <div className="blog__details__comment__item__text">
                        <span>{c.timeAgo}</span>
                        <h5>{c.userName}</h5>
                        <p>{c.comment}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="blog__details__form">
                  <h4>Leave A Comment</h4>
                  <form onSubmit={handleAddComment}>
                    <div className="row">
                      <div className="col-lg-12">
                        <textarea
                          placeholder="Your Message..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          rows={4}
                          required
                        ></textarea>
                        <button type="submit" className="site-btn">Send Message</button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
