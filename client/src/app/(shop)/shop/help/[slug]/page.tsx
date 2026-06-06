"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/options";
import { API } from "@/lib/endpoints";
import { PageLoader } from "@/components/shared/ui";

interface HelpPage {
  slug: string;
  label: string;
  content: string;
}

export default function HelpPage() {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<HelpPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    api
      .get(`${API.common.helpPages}/${slug}`)
      .then(({ data }) => {
        if (data.success && data.data) setPage(data.data);
        else setNotFound(true);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <PageLoader />;

  if (notFound) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Page Not Found</h1>
        <p className="text-gray-500">This help page doesn&apos;t exist yet.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">{page?.label}</h1>
      <div
        className="prose prose-gray max-w-none text-gray-700 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: page?.content || "" }}
      />
    </div>
  );
}
