import { useState, useEffect } from "react";
import { LOGIN } from "../queries";
import { useMutation } from "@apollo/client/react";
import { useNavigate } from "react-router-dom";

const Login = ({setToken}) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const [login, result] = useMutation(LOGIN);

  useEffect(() => {
    if (result.data) {
      const token = result.data.login.value;
      setToken(token);
      localStorage.setItem("user-token", token);
      navigate("/");
    }
  }, [result.data, setToken, navigate]);

  const submit = (event) => {
    event.preventDefault();
    login({ variables: { username, password } });
  };

  return (
    <form onSubmit={submit}>
      <h1>Login</h1>
      username{" "}
      <input
        type="text"
        name="username"
        value={username}
        onChange={({ target }) => setUsername(target.value)}
      />
      <br />
      password{" "}
      <input
        type="password"
        name="password"
        value={password}
        onChange={({ target }) => setPassword(target.value)}
      />
      <br />
      <button type="submit">login</button>
    </form>
  );
};

export default Login;
