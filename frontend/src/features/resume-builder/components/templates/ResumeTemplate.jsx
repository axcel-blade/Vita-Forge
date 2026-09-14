import React from "react";

export default function ResumeTemplate({ data }) {
  const accent = data.meta.accent;
  const profile = data.profile;

  return (
    <div className="print-page mx-auto space-y-4 bg-white p-8 text-[14px] leading-6 font-serif">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold" style={{ color: accent }}>
          {profile.fullName}
        </h1>
        <p className="text-gray-700 text-sm">{profile.title}</p>
        <p className="text-xs text-gray-600 mt-1">
          {profile.email} • {profile.phone} • {profile.location}
        </p>

        {data.links?.length > 0 && (
          <p className="mt-1 text-xs text-gray-600">
            {data.links.map((l, i) => (
              <span key={l.id}>
                <a
                  href={l.url.startsWith("http") ? l.url : `https://${l.url}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sky-600 hover:underline print:no-underline"
                >
                  {l.label}
                </a>
                {i < data.links.length - 1 && " • "}
              </span>
            ))}
          </p>
        )}
      </div>

      {/* Summary */}
      {profile.summary && (
        <div>
          <h3 className="text-sm font-semibold uppercase" style={{ color: accent }}>
            Summary
          </h3>
          <p className="text-[13px] text-gray-700 mt-1">{profile.summary}</p>
        </div>
      )}

      {/* Experience */}
      {data.experience?.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold uppercase" style={{ color: accent }}>
            Experience
          </h3>
          {data.experience.map((e) => (
            <div key={e.id} className="mt-2">
              <div className="flex justify-between items-baseline">
                <span className="font-medium text-[13px]">{e.role}</span>
                {e.start && (
                  <span className="text-xs text-gray-500">{e.start} – {e.end}</span>
                )}
              </div>
              <p className="text-[12px] text-gray-600 italic">{e.company}</p>
              {e.location && <p className="text-[12px] text-gray-600">{e.location}</p>}
              {e.bullets?.length > 0 && (
                <ul className="ml-5 list-disc text-[12px] text-gray-700 mt-1">
                  {e.bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Projects */}
      {data.projects?.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold uppercase" style={{ color: accent }}>
            Projects
          </h3>
          {data.projects.map((p) => (
            <div key={p.id} className="mt-2">
              <div className="flex justify-between items-baseline">
                <span className="font-medium text-[13px]">{p.title}</span>
                {p.start && (
                  <span className="text-xs text-gray-500">{p.start} – {p.end}</span>
                )}
              </div>
              {p.organization && (
                <p className="text-[12px] text-gray-600 italic">{p.organization}</p>
              )}
              {p.bullets?.length > 0 && (
                <ul className="ml-5 list-disc text-[12px] text-gray-700 mt-1">
                  {p.bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {data.education?.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold uppercase" style={{ color: accent }}>
            Education
          </h3>
          {data.education.map((e) => (
            <div key={e.id} className="mt-2">
              <div className="flex justify-between items-baseline">
                <span className="font-medium text-[13px]">{e.degree}</span>
                {e.start && (
                  <span className="text-xs text-gray-500">{e.start} – {e.end}</span>
                )}
              </div>
              <p className="text-[12px] text-gray-600 italic">{e.school}</p>
              {e.location && <p className="text-[12px] text-gray-600">{e.location}</p>}
              {e.bullets?.length > 0 && (
                <ul className="ml-5 list-disc text-[12px] text-gray-700 mt-1">
                  {e.bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Achievements */}
      {data.achievements?.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold uppercase" style={{ color: accent }}>
            Achievements
          </h3>
          {data.achievements.map((a) => (
            <div key={a.id} className="mt-2">
              <div className="flex justify-between items-baseline">
                <span className="font-medium text-[13px]">{a.title}</span>
                {a.year && <span className="text-xs text-gray-500">{a.year}</span>}
              </div>
              {a.organization && (
                <p className="text-[12px] text-gray-600 italic">{a.organization}</p>
              )}
              {a.bullets?.length > 0 && (
                <ul className="ml-5 list-disc text-[12px] text-gray-700 mt-1">
                  {a.bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {data.skillGroups?.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold uppercase" style={{ color: accent }}>
            Skills
          </h3>
          {data.skillGroups.map((g) => (
            <div key={g.id} className="mt-2">
              <p className="text-[13px] font-medium">{g.title}</p>
              {g.bullets?.length > 0 && (
                <ul className="ml-5 list-disc text-[12px] text-gray-700">
                  {g.bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}