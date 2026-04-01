import "../styles/Newspaper.css";
import HTMLFlipBook from "react-pageflip";
export default function Newspaper() {
  function MyBook(props) {
    return (
      <HTMLFlipBook
        width={window.innerWidth * 0.3}
        height={window.innerHeight * 0.8}
      >
        <div className="demoPage bg-[url('/assets/Newspaper.png')] bg-cover">
          Page 1
        </div>
        <div className="demoPage bg-[url('/assets/Newspaper.png')] bg-cover">
          Page 2
        </div>
        <div className="demoPage bg-[url('/assets/Newspaper.png')] bg-cover">
          Page 3
        </div>
        <div className="demoPage bg-[url('/assets/Newspaper.png')] bg-cover">
          Page 4
        </div>
      </HTMLFlipBook>
    );
  }

  return (
    <>
      <div className="bgTable bg-[url('/assets/table.png')] w-screen h-screen flex justify-center items-center bg-cover overflow-hidden">
        {/* <MyBook  /> */}
        {/* <div className="main bg-[url('/assets/Newspaper.png')] w-[80vw] bg-black h-[80vh] bg-contain repeat">
          5
          <h1 className="newspaperTitle text-7xl font-[cursive] text-center  text-gray-800">
            Linked Out
          </h1>
          <MyBook/>
        </div> */}
        <div className="page p-3 bg-[url('/assets/Newspaper.png')] grayscale bg-cover h-[80vh] w-[30vw]">
          <div className="newsHeader h-[5%] p-0 m-0 border"></div>
          <div className="newsContent flex gap-6 mt-2">
            <div className="col1 ">
              <h2 className="newsHeading text-2xl text-center">Falana 1</h2>
              <img src="/assets/test.png" className="newsImage max-w-[55%] float-left mr-4 " />
              <p className="newsContent text-justify">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Minus
                numquam quaerat ipsa commodi earum optio quia ut, quis
                distinctio pariatur cumque amet vitae dolore non nobis. Atque
                numquam nihil facere vitae quis aliquid incidunt quia, voluptas
                sequi. Nam, at maiores! Lorem ipsum dolor sit amet consectetur adipisicing elit. Itaque blanditiis omnis doloribus quidem. Fugiat obcaecati veritatis ea nihil! Eveniet similique inventore at, tempora numquam delectus quidem pariatur recusandae odio rem?
              </p>
            </div>
            <div className="col2 ">
              <h2 className="newsHeading text-2xl text-center">Falana 2</h2>
              <img src={"/assets/test.png"} className="newsImage max-w-[55%] float-left mr-4" />
              <p className="newsContent text-justify">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Minus
                numquam quaerat ipsa commodi earum optio quia ut, quis
                distinctio pariatur cumque amet vitae dolore non nobis. Atque
                numquam nihil facere vitae quis aliquid incidunt quia, voluptas
                sequi. Nam, at maiores! Lorem ipsum dolor sit amet consectetur adipisicing elit. Itaque blanditiis omnis doloribus quidem. Fugiat obcaecati veritatis ea nihil! Eveniet similique inventore at, tempora numquam delectus quidem pariatur recusandae odio rem?
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
