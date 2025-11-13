import { useQuery, useMutation } from "@apollo/client/react";
import { AUTHORS, EDIT_BIRTH_YEAR } from "../queries";
import { useState } from "react";

const Authors = () => {
  const [born, setBorn] = useState("");
  const [name, setName] = useState("");
  const token = localStorage.getItem('user-token')

  const result = useQuery(AUTHORS);
  const [edit_birth_year] = useMutation(EDIT_BIRTH_YEAR, {
    refetchQueries: [{ query: AUTHORS }],
  });

  if (result.loading) {
    return <p>No Data Available Yet</p>;
  }

  const authors = result.data.allAuthors;
  const setBornTo = born;

  const nameOptions = authors.map(author => <option key={author.name} value={author.name}>{author.name}</option>)

  const updateBirthYear = (event) => {
    event.preventDefault();
    edit_birth_year({ variables: { name, setBornTo } });

    setName("");
    setBorn("");
  };

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>

      { token &&
        <>
          <h2>Set Birth Year</h2>
          <form onSubmit={updateBirthYear}>
            name
            <select
              name="name"
              onChange={({ target }) => setName(target.value)}
            >
              {nameOptions}
            </select>
            <br />
            born
            <input
              name="born"
              type="number"
              value={born}
              onChange={({ target }) => setBorn(Number(target.value))}
            />
            <br />
            <button type="submit">Edit</button>
          </form>
        </>
      }
    </div>
  );
};

export default Authors;
