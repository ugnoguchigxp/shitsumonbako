import { Link } from "react-router-dom";

export const ThanksPage = () => {
  return (
    <main className="page">
      <section className="panel compact">
        <h1>Thank you</h1>
        <p>投稿ありがとうございました。</p>
        <Link to="/" className="button-link">
          戻る
        </Link>
      </section>
    </main>
  );
};
