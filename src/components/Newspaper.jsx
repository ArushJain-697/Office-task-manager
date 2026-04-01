import "../styles/Newspaper.css";
export default function Newspaper() {
  return (
    <>
    <div className="bgTable bg-[url('../assets/table.png')] w-screen h-screen flex justify-center items-center bg-cover">
      <div className="main bg-[url('../assets/Newspaper.png')] w-[80vw] bg-black h-[80vh] bg-contain repeat">5
        <h1 className="newspaperTitle text-7xl font-[cursive] text-center  text-gray-800">
          Linked Out
        </h1>
      </div>
    </div>
    </>
  );
}
