import "./styles.css";
import "virtual:uno.css";
import "@unocss/reset/tailwind.css";
import "@fontsource-variable/inter";
import { commands } from "./bindings";

function App() {
  return (
    <main class="font-primary h-full bg-gray-200">
      <button
        type="button"
        class="btn btn-primary"
        onClick={async () => {
          const test = await commands.helloWorld("World");
          console.log(test);
          
        }}
      >
        Primary Button
      </button>
    </main>
  );
}

export default App;
