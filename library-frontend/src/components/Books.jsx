import { useQuery } from "@apollo/client/react";
import { BOOKS_BY_GENRE } from "../queries";
import { useState } from "react";

const Books = () => {
  const [genre, setGenre] = useState("");

  const result = useQuery(BOOKS_BY_GENRE, {
    variables: { genre },
  });

  if (result.loading) {
    return <p>No results Yet</p>;
  }

  const books = result.data.allBooks;

  return (
    <div>
      <h2>books</h2>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={() => setGenre('thriller')}>thriller</button>
      <button onClick={() => setGenre('romance')}>romance</button>
      <button onClick={() => setGenre('patterns')}>patterns</button>
      <button onClick={() => setGenre('design')}>design</button>
      <button onClick={() => setGenre('crime')}>crime</button>
      <button onClick={() => setGenre('classic')}>classic</button>
      <button onClick={() => setGenre('')}>all genres</button>
    </div>
  );
};

export default Books;
