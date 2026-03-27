import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { createFeedback } from "../api";

type FormData = {
  targetText: string;
  messageText: string;
};

export const HomePage = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState } = useForm<FormData>({
    defaultValues: {
      targetText: "",
      messageText: ""
    }
  });

  const mutation = useMutation({
    mutationFn: createFeedback,
    onSuccess: () => {
      navigate("/thanks");
    }
  });

  const onSubmit = handleSubmit((values) => {
    mutation.mutate({
      targetText: values.targetText,
      messageText: values.messageText
    });
  });

  return (
    <main className="page">
      <section className="panel">
        <h1>NDTJ ご意見箱</h1>
        <p className="lead">認証なしで投稿できます。投稿者を特定できる情報は保存しません。</p>

        <form onSubmit={onSubmit} className="form">
          <label htmlFor="targetText">NDTJの誰に当てたものか？ (空欄でも良い。)</label>
          <input
            id="targetText"
            type="text"
            {...register("targetText", { maxLength: 200 })}
            placeholder="任意"
          />

          <label htmlFor="messageText">
            NDTJの改善するべきと思える項目、アドバイス、ストレスを感じたエピソードを記述してください
          </label>
          <textarea
            id="messageText"
            rows={8}
            {...register("messageText", {
              required: "本文は必須です",
              maxLength: 5000
            })}
            placeholder="ご意見を自由にどうぞ"
          />
          {formState.errors.messageText && (
            <p className="error">{formState.errors.messageText.message}</p>
          )}
          {mutation.isError && (
            <p className="error">
              送信に失敗しました：{mutation.error instanceof Error ? mutation.error.message : "時間をおいて再試行してください。"}
            </p>
          )}

          <button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "送信中..." : "送信する"}
          </button>
        </form>
      </section>
    </main>
  );
};
