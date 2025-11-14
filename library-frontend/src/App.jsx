import { useEffect, useState } from "react";
import Authors from "./components/Authors";
import Books from "./components/Books";
import NewBook from "./components/NewBook";
import { useSubscription } from "@apollo/client/react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Link,
  useNavigate,
} from "react-router-dom";
import Login from "./components/Login";
import { useApolloClient } from "@apollo/client/react";
import Recommended from "./components/Recommended";
import { BOOK_ADDED, BOOKS_BY_GENRE } from "./queries";

const App = () => {
  const [token, setToken] = useState(null);

  useEffect(() => {
    const fetchToken = () => {
      const token = localStorage.getItem("user-token");
      if (token) {
        setToken(token);
      }
    };
    fetchToken();
  }, [token]);
  const client = useApolloClient();

  const Logout = () => {
    const navigate = useNavigate();
    useEffect(() => {
      const performLogout = async () => {
        setToken(null);
        localStorage.removeItem("user-token");
        await client.resetStore();
        navigate("/");
      };
      performLogout();
    }, [navigate]);

    return <div>Logging out...</div>;
  };

  useSubscription(BOOK_ADDED, {
    onData: ({ data }) => {
      console.log(data);
      const addedBook = data.data.bookAdded;

      client.cache.updateQuery(
        { query: BOOKS_BY_GENRE, variables: { genre: "" } },
        (data) => {
          console.log('the data', data)
          return {
            allBooks: data?.allBooks.concat(addedBook),
          };
        }
      );
    },
  });

  return (
    <Router>
      <div>
        <Link to="/">
          <button>authors</button>
        </Link>
        <Link to="/books">
          <button>books</button>
        </Link>
        {!token && (
          <Link to="/login">
            <button>login</button>
          </Link>
        )}

        {token && (
          <Link to="/add-book">
            <button>add book</button>
          </Link>
        )}

        {token && (
          <Link to="/logout">
            <button>logout</button>
          </Link>
        )}

        {token && (
          <Link to="/recommended">
            <button>recommended</button>
          </Link>
        )}
      </div>

      <Routes>
        <Route path="/" element={<Authors />} />
        <Route path="/books" element={<Books />} />
        <Route path="/login" element={<Login setToken={setToken} />} />
        <Route path="/add-book" element={<NewBook />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/recommended" element={<Recommended />} />
      </Routes>
    </Router>
  );
};

export default App;
