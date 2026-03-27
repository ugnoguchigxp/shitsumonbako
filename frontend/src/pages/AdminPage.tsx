import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  deleteAdminFeedback,
  fetchAdminFeedbacks
} from "../api";

const queryKey = ["admin-feedbacks"];

export const AdminPage = () => {
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const feedbackQuery = useQuery({
    queryKey,
    queryFn: fetchAdminFeedbacks
  });

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey });
  };

  const deleteMutation = useMutation({
    mutationFn: deleteAdminFeedback,
    onSuccess: async () => {
      await refresh();
    }
  });

  const toggleExpand = (id: number) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  return (
    <main className="page admin">
      <section className="panel">
        <h1>管理画面</h1>

        <div className="list-head">
          <h2>投稿一覧</h2>
          <button type="button" className="ghost" onClick={refresh}>
            再取得
          </button>
        </div>

        {feedbackQuery.isLoading && <p>読み込み中...</p>}
        {feedbackQuery.isError && <p className="error">一覧の取得に失敗しました。</p>}

        {feedbackQuery.data && (
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>作成日時</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {feedbackQuery.data.map((item) => {
                  const isExpanded = expandedId === item.id;
                  return (
                    <React.Fragment key={item.id}>
                      <tr className={isExpanded ? "row-expanded" : ""}>
                        <td>{item.id}</td>
                        <td>{new Date(item.createdAt).toLocaleString("ja-JP")}</td>
                        <td>
                          <div className="button-row">
                            <button
                              type="button"
                              className="ghost"
                              onClick={() => toggleExpand(item.id)}
                            >
                              {isExpanded ? "閉じる" : "詳細を表示"}
                            </button>
                            <button
                              type="button"
                              className="danger"
                              onClick={() => {
                                if (window.confirm(`ID ${item.id} を削除しますか？`)) {
                                  deleteMutation.mutate(item.id);
                                }
                              }}
                              disabled={deleteMutation.isPending}
                            >
                              削除
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="details-row">
                          <td colSpan={3}>
                            <div className="details-content">
                              <div className="detail-item">
                                <span className="label">宛先</span>
                                <div className="value">{item.targetText || "(なし)"}</div>
                              </div>
                              <div className="detail-item">
                                <span className="label">本文</span>
                                <div className="value message-text">{item.messageText}</div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
};
