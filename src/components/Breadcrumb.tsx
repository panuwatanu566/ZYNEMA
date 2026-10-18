import React from 'react';
import { Link } from 'react-router-dom';

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <div className="custom-breadcrumb-bar">
      <div className="container">
        <nav aria-label="breadcrumb">
          <ol>
            <li>
              <Link to="/">
                <i className="fa fa-home mr-1 text-danger"></i> Home
              </Link>
            </li>
            {items.map((item, index) => {
              const isLast = index === items.length - 1;
              return (
                <React.Fragment key={index}>
                  <li className="separator">
                    <i className="fa fa-angle-right"></i>
                  </li>
                  <li className={isLast ? 'current-item' : ''}>
                    {isLast || !item.to ? (
                      <span className="current-item" title={item.label}>
                        {item.label}
                      </span>
                    ) : (
                      <Link to={item.to} title={item.label}>
                        {item.label}
                      </Link>
                    )}
                  </li>
                </React.Fragment>
              );
            })}
          </ol>
        </nav>
      </div>
    </div>
  );
};
