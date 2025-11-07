import Authors from "./components/Authors";
import Books from "./components/Books";
import NewBook from "./components/NewBook";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";

const App = () => {

  return (
    <Router>
      <div>
        <Link to='/'><button>authors</button></Link>
        <Link to='/books'><button>books</button></Link>
        <Link to='/add-book'><button>add book</button></Link>
      </div>

      <Routes>
        <Route path="/" element={<Authors />} />
        <Route path="/books" element={<Books />} />
        <Route path="/add-book" element={<NewBook />} />
      </Routes>

    </Router>
  );
};

export default App;
