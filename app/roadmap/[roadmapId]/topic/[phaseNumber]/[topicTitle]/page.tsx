"use client";

import React from "react";
import { useParams, useSearchParams } from "next/navigation";
import { TopicDetailPage } from "@/src/components/TopicDetailPage";

export default function TopicPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const roadmapId = params?.roadmapId as string;
  const phaseNumber = parseInt(params?.phaseNumber as string, 10);
  const topicTitle = decodeURIComponent(params?.topicTitle as string);
  const phaseTitle = searchParams?.get("phaseTitle") || "";
  const goal = searchParams?.get("goal") || "";

  return (
    <TopicDetailPage
      phaseNumber={phaseNumber}
      topicTitle={topicTitle}
      phaseTitle={phaseTitle}
      goal={goal}
      roadmapId={roadmapId}
    />
  );
}
