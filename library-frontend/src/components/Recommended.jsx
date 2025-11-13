import { useQuery } from "@apollo/client/react";
import { USER_GENRE, BOOKS_BY_GENRE } from "../queries";

const Recommended = () => {
  const result = useQuery(USER_GENRE);

  let genre;
  if (!result.loading) {
    genre = result.data.me.favoriteGenre || "none";
  }

  const bookResult = useQuery(BOOKS_BY_GENRE, {
    variables: { genre },
  });

  if (bookResult.loading) {
    return <p>No results Yet</p>;
  }

  const books = bookResult.data.allBooks;

  return (
    <>
      <h1>Reccomendatioons</h1>
      <p>books in your favorite genre &apos;{genre}&apos;</p>

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
    </>
  );
};

export default Recommended;
