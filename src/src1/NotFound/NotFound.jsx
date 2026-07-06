import { Link } from "react-router-dom";
import "../NotFound/NotFoundStyle.css";

export default function NotFound() {
  return (
    <div className="notfound-container">
      <div className="notfound-content">
        <h1 className="notfound-title">404</h1>
        <p className="notfound-message">
          Oops Bro! The page you’re looking for doesn’t exist.
        </p>
        <Link to="/" className="notfound-btn">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
