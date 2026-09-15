/* src/website/pages/Home.jsx */

import React from "react";
import { Link } from "react-router-dom";
import heroImage from "../assets/images/interview.svg";
import { AccountPanel } from "../../auth";
import { useAuth } from "../../../services/auth-context";

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      {isAuthenticated ? (
        <AccountPanel />
      ) : (
        !isLoading && (
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Career documents, built in one workflow.</h1>
              <p className="mt-4 max-w-3xl text-gray-600">
                Vita Forge helps create professional resumes and cover letters that help you impress recruiters,
                pass ATS systems, and land your dream job with{" "}
                <span className="font-semibold text-sky-700">PROFESSIONAL Templates</span> and{" "}
                <span className="font-semibold text-sky-700">ATS-FRIENDLY</span> content.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/products"
                  className="inline-flex rounded-lg bg-sky-600 px-5 py-3 text-sm font-semibold text-white hover:bg-sky-700"
                >
                  View Products
                </Link>
                <Link
                  to="/apps/resume-builder"
                  className="inline-flex rounded-lg border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Build My Resume
                </Link>
              </div>
            </div>
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <img
                src={heroImage}
                alt="Resume builder illustration"
                className="mx-auto h-72 w-full max-w-3xl object-contain"
              />
            </div>
          </div>
        )
      )}
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="font-semibold text-gray-900">Structured Editing</h3>
          <p className="mt-2 text-sm text-gray-600">
            Update profile, experience, education, skills, and references using focused input sections.
          </p>
        </article>
        <article className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="font-semibold text-gray-900">Live A4 Preview</h3>
          <p className="mt-2 text-sm text-gray-600">
            See exactly how your resume and cover letter appear on an A4 page before exporting.
          </p>
        </article>
        <article className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="font-semibold text-gray-900">Unified Data</h3>
          <p className="mt-2 text-sm text-gray-600">
            Reuse resume profile details in your cover letter and import/export both documents in one JSON.
          </p>
        </article>
      </div>
    </section>
  );
}
