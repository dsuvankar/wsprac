import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import "./App.css";
import Input from "./components/input";

function App() {
  const [scores, setScores] = useState({});
  const [allScores, setAllScores] = useState([]);
  const [onlineCount, setOnlineCount] = useState(0);
  const [myId, setMyId] = useState("");
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io("http://localhost:3000");

    socketRef.current.on("connect", () => {
      setMyId(socketRef.current.id);
    });
    socketRef.current.on("playerScores", (playerScores) => {
      setAllScores(playerScores);
    });

    socketRef.current.on("userCount", (count) => {
      setOnlineCount(count);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  const handleInput = (event) => {
    const { name, value } = event.target;
    setScores((prev) => ({ ...prev, [name]: value }));
  };

  const sendScores = () => {
    if (!socketRef.current) return;
    socketRef.current.emit("scores", scores);
  };

  const handleDelete = (index) => {
    if (!socketRef.current) return;
    socketRef.current.emit("deleteScore", index);
  };

  return (
    <>
      <h1>Welcome to React Multi player dashboard</h1>
      <h3 style={{ color: "green" }}>Live Users: {onlineCount}</h3>
      <Input
        name="name"
        placeholder="Enter your Name"
        handleInput={handleInput}
      />
      <Input
        name="score"
        placeholder="Enter your Score"
        handleInput={handleInput}
      />

      <button className="send-scores" onClick={sendScores}>
        Publish Score
      </button>

      {allScores.length > 0 ? (
        <table>
          <tbody>
            <tr>
              <th>Name</th>
              <th>Score</th>
              <th>Action</th>
            </tr>

            {allScores.map((score, i) => (
              <tr key={i}>
                <td>{score?.name}</td>
                <td>{score?.score}</td>
                <td>
                  {score.id === myId ? (
                    <button onClick={() => handleDelete(i)}>Delete</button>
                  ) : (
                    <span style={{ color: "gray", fontSize: "12px" }}>
                      Read Only
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </>
  );
}

export default App;
