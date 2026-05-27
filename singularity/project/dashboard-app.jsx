/* Mount + Red Vision toggle for Dashboard prototype */

const App = () => {
  const [red, setRed] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("red-vision", red);
  }, [red]);

  return <DashboardScreen red={red} setRed={setRed}/>;
};

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
