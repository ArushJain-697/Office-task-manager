import "../styles/Newspaper.css";
import React from "react";
import HTMLFlipBook from "react-pageflip";
import CinematicPage from "../components/CinematicPage";
import { useEffect,useState } from "react";
export default function Newspaper() {
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth * 0.3,
    height: window.innerHeight * 0.8,
  });
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth > 768 ? window.innerWidth * 0.3 : window.innerWidth * 0.8,
        height: window.innerHeight * 0.8,
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const Page = React.forwardRef((props, ref) => {
    return (
        <div className="demoPage bg-contain select-none z-3 " ref={ref}>
          {/* <h1>Page Header</h1>
            <p>{props.children}</p>
            <p>Page number: {props.number}</p> */}
          <SinglePage />
        </div>
    );
  });
  // function MyBook(props) {
  //     return (
  //         <HTMLFlipBook width={300} height={500}>
  //             <Page number="1">Page text</Page>
  //             <Page number="2">Page text</Page>
  //             <Page number="3">Page text</Page>
  //             <Page number="4">Page text</Page>
  //         </HTMLFlipBook>
  //     );
  // }
  // function MyBook(props) {
  //     return (
  //         <HTMLFlipBook width={300} height={500}>
  //             <Page number="1">Page text</Page>
  //             <Page number="2">Page text</Page>
  //             <Page number="3">Page text</Page>
  //             <Page number="4">Page text</Page>
  //         </HTMLFlipBook>
  //     );
  // }

  function MyBook(props) {
    return (
      <HTMLFlipBook
        width={window.innerWidth * 0.3}
        height={window.innerHeight * 0.8}
        maxShadowOpacity={0.3}
        // size="stretch"
      >
        <Page className="demoPage bg-[url('/assets/Newspaper.png')] bg-cover">
          {/* <singlePage className="demoPage" /> */}
        </Page>
        <Page className="demoPage bg-[url('/assets/Newspaper.png')] bg-cover">
          {/* <singlePage className="demoPage" /> */}
        </Page>
        <Page className="demoPage bg-[url('/assets/Newspaper.png')] bg-cover">
          {/* <singlePage className="demoPage" /> */}
        </Page>
        <Page className="demoPage bg-[url('/assets/Newspaper.png')] bg-cover">
          {/* <singlePage className="demoPage" /> */}
        </Page>
        <Page className="demoPage bg-[url('/assets/Newspaper.png')] bg-cover">
          {/* <singlePage className="demoPage" /> */}
        </Page>
        <Page className="demoPage bg-[url('/assets/Newspaper.png')] bg-cover">
          {/* <singlePage className="demoPage" /> */}
        </Page>
        <Page className="demoPage bg-[url('/assets/Newspaper.png')] bg-cover">
          {/* <singlePage className="demoPage" /> */}
        </Page>
        <Page className="demoPage bg-[url('/assets/Newspaper.png')] bg-cover">
          {/* <singlePage className="demoPage" /> */}
        </Page>
        <Page className="demoPage bg-[url('/assets/Newspaper.png')] bg-cover">
          {/* <singlePage className="demoPage" /> */}
        </Page>
        <Page className="demoPage bg-[url('/assets/Newspaper.png')] bg-cover">
          {/* <singlePage className="demoPage" /> */}
        </Page>
      </HTMLFlipBook>
    );
  }

  return (
    <CinematicPage>

      <div className="bgTable bg-[url('/assets/table.png')] fixed inset-0 flex justify-center items-center bg-cover overflow-hidden">
        <MyBook />
        <img
          src="/assets/wanted.jpeg"
          alt="wanted image"
          draggable={false}
          className="absolute right-30 top-10 rotate-45 max-w-30 p-1 hover:border-2 border-amber-300 hover:scale-110s box-content "
          />
        <div className="vignette z-10 absolute w-full h-full bg-transparent pointer-events-none"></div>
      </div>
          </CinematicPage>
  );
}
function SinglePage() {
  return (
    <>
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
            <img
              src="/assets/test.png"
              className="newsImage max-w-[55%] float-left mr-4 "
            />
            <p className="newsContent text-justify">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Minus
              numquam quaerat ipsa commodi earum optio quia ut, quis distinctio
              pariatur cumque amet vitae dolore non nobis. Atque numquam nihil
              facere vitae quis aliquid incidunt quia, voluptas sequi. Nam, at
              maiores! Lorem ipsum dolor sit amet consectetur adipisicing elit.
              Itaque blanditiis omnis doloribus quidem. Fugiat obcaecati
              veritatis ea nihil! Eveniet similique inventore at, tempora
              numquam delectus quidem pariatur recusandae odio rem?
            </p>
          </div>
          <div className="col2 ">
            <h2 className="newsHeading text-2xl text-center">Falana 2</h2>
            <img
              src={"/assets/test.png"}
              className="newsImage max-w-[55%] float-left mr-4"
            />
            <p className="newsContent text-justify">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Minus
              numquam quaerat ipsa commodi earum optio quia ut, quis distinctio
              pariatur cumque amet vitae dolore non nobis. Atque numquam nihil
              facere vitae quis aliquid incidunt quia, voluptas sequi. Nam, at
              maiores! Lorem ipsum dolor sit amet consectetur adipisicing elit.
              Itaque blanditiis omnis doloribus quidem. Fugiat obcaecati
              veritatis ea nihil! Eveniet similique inventore at, tempora
              numquam delectus quidem pariatur recusandae odio rem?
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
