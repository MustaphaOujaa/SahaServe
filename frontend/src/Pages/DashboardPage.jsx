import React, { useMemo, useState } from "react";

const metrics = [
  { label: "Revenue", value: "$4,820", icon: "fa-chart-line", tone: "gold", detail: "+12% this week" },
  { label: "Orders", value: "38", icon: "fa-receipt", tone: "brown", detail: "9 pending" },
  { label: "Reservations", value: "16", icon: "fa-calendar-check", tone: "green", detail: "5 tonight" },
  { label: "Active Tables", value: "12/18", icon: "fa-chair", tone: "red", detail: "6 unavailable" },
];

const sections = [
  { id: "overview", label: "Overview", icon: "fa-border-all" },
  { id: "users", label: "Users", icon: "fa-users" },
  { id: "orders", label: "Orders", icon: "fa-receipt" },
  { id: "reservations", label: "Reservations", icon: "fa-calendar-check" },
  { id: "tables", label: "Tables", icon: "fa-chair" },
  { id: "menu", label: "Menu", icon: "fa-utensils" },
  { id: "reviews", label: "Reviews", icon: "fa-star-half-alt" },
  { id: "ai-services", label: "AI Services", icon: "fa-brain" },
  { id: "roles", label: "Roles", icon: "fa-shield-alt" },
];

const users = [
  { name: "Amina El Fassi", email: "amina@sahaserve.com", role: "admin", phone: "+212 600 123 456" },
  { name: "Youssef Karim", email: "youssef@example.com", role: "delivery", phone: "+212 611 987 420" },
];

const orders = [
  { id: "#1042", customer: "Sara Benali", items: "Lamb Tagine x1, Mint Tea x2", total: "$34", status: "preparing" },
  { id: "#1041", customer: "Omar Idrissi", items: "Royal Couscous x2", total: "$48", status: "pending" },
];

const reservations = [
  { guest: "Nadia Alaoui", table: "Table 7", date: "May 21", time: "20:00 - 21:30", status: "confirmed" },
  { guest: "Hamza Rami", table: "Table 3", date: "May 22", time: "19:00 - 20:30", status: "pending" },
];

const tables = [
  { name: "Patio Table", number: 7, capacity: 4, available: true },
  { name: "Window Table", number: 3, capacity: 2, available: false },
];

const dishes = [
  { name: "Lamb Tagine", category: "Tagines", price: "$28", status: "available" },
  { name: "Bastilla Sucree", category: "Desserts", price: "$9", status: "hidden" },
];

const categories = [
  { name: "Tagines", items: 8 },
  { name: "Desserts", items: 5 },
];

const tags = [
  { name: "Chef's Pick", usage: 6 },
  { name: "Vegan", usage: 4 },
];

const reviews = [
  { dish: "Lamb Tagine", user: "Sofia Larsson", rating: 5, comment: "Perfectly spiced and generous." },
  { dish: "Zaalouk Salad", user: "Amara Diallo", rating: 4, comment: "Fresh, smoky, and light." },
];

const reviewAnalyses = [
  {
    review: "The food was excellent and warm, but delivery arrived late and the driver forgot one drink.",
    sentiment: "positive",
    confidence: 0.86,
    aspects: {
      food: "positive",
      service: "neutral",
      delivery: "negative",
      price: "N/A",
      cleanliness: "N/A",
    },
    key_points: ["Excellent warm food", "Delivery arrived late", "One drink was missing"],
    main_issue: "Late delivery with a missing item",
    category: "Moroccan restaurant",
    business_insight: {
      main_problem: "Delivery handoff and order verification are inconsistent during busy periods.",
      recommendation: "Add a final bag checklist before dispatch and flag late deliveries for staff follow-up.",
    },
    severity_score: 6.4,
  },
  {
    review: "The couscous tasted fresh, service was kind, and the restaurant was very clean.",
    sentiment: "positive",
    confidence: 0.94,
    aspects: {
      food: "positive",
      service: "positive",
      delivery: "N/A",
      price: "neutral",
      cleanliness: "positive",
    },
    key_points: ["Fresh couscous", "Kind service", "Clean dining room"],
    main_issue: null,
    category: "Moroccan restaurant",
    business_insight: {
      main_problem: "No critical issue detected in this review.",
      recommendation: "Use this feedback in staff recognition and promote couscous as a reliable customer favorite.",
    },
    severity_score: 1.2,
  },
];

const roles = [
  { role: "admin", permissions: "all permissions" },
  { role: "chef", permissions: "manage orders, mark ready, manage dishes, tags" },
  { role: "delivery", permissions: "take delivery, mark delivered" },
];

const statusStyles = {
  pending: "bg-[#fff7e5] text-[#9a6813] border-[#f0d9a5]",
  preparing: "bg-[#f5e6c8] text-[#6b4b25] border-[#e4c88d]",
  confirmed: "bg-[#edf8ef] text-[#287a3e] border-[#bee2c8]",
  available: "bg-[#edf8ef] text-[#287a3e] border-[#bee2c8]",
  hidden: "bg-[#f7ece9] text-[#9b3f2f] border-[#e8c5bd]",
  positive: "bg-[#edf8ef] text-[#287a3e] border-[#bee2c8]",
  negative: "bg-[#f7ece9] text-[#9b3f2f] border-[#e8c5bd]",
  neutral: "bg-[#f6f0e4] text-[#6b4b25] border-[#e6d6bc]",
  "N/A": "bg-[#f8f6f1] text-[#8a7662] border-[#e8dfd2]",
};

function StatusBadge({ value }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[0.72rem] font-semibold capitalize ${statusStyles[value] || statusStyles.pending}`}>
      {value}
    </span>
  );
}

function SectionHeader({ eyebrow, title, action }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-beige pb-4">
      <div>
        <span className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-gold">{eyebrow}</span>
        <h2 className="font-['Cormorant_Garamond'] text-[1.75rem] font-bold leading-tight text-brown-dark">{title}</h2>
      </div>
      {action && (
        <button className="btn btn-outline !px-4 !py-2">
          <i className="fas fa-plus text-[0.72rem]"></i>
          {action}
        </button>
      )}
    </div>
  );
}

function AdminCard({ children, className = "" }) {
  return (
    <div className={`rounded-[16px] border border-[rgba(200,146,42,0.14)] bg-white shadow-custom ${className}`}>
      {children}
    </div>
  );
}

function SeverityMeter({ score }) {
  const width = `${Math.min(Math.max(score * 10, 0), 100)}%`;
  const color = score >= 7 ? "bg-[#b84a34]" : score >= 4 ? "bg-gold" : "bg-[#3b8a4d]";

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-[0.78rem] font-semibold text-text-mid">
        <span>Severity score</span>
        <span className="text-brown-dark">{score.toFixed(1)}/10</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-beige">
        <div className={`h-full rounded-full ${color}`} style={{ width }}></div>
      </div>
    </div>
  );
}

function AspectGrid({ aspects }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
      {Object.entries(aspects).map(([aspect, value]) => (
        <div key={aspect} className="rounded-[12px] border border-beige bg-white p-3">
          <div className="mb-2 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-text-mid">{aspect}</div>
          <StatusBadge value={value} />
        </div>
      ))}
    </div>
  );
}

function SimpleTable({ columns, rows }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[620px] border-collapse text-left">
        <thead>
          <tr className="border-b border-beige bg-cream/70">
            {columns.map((column) => (
              <th key={column} className="px-5 py-3 text-[0.72rem] font-bold uppercase tracking-[0.12em] text-text-mid">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-b border-beige/70 last:border-0">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-5 py-4 text-[0.86rem] text-text-mid">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const DashboardPage = () => {
  const [activeSection, setActiveSection] = useState("overview");

  const orderRows = useMemo(
    () =>
      orders.map((order) => [
        <strong className="text-brown-dark">{order.id}</strong>,
        order.customer,
        order.items,
        <strong className="text-brown-dark">{order.total}</strong>,
        <StatusBadge value={order.status} />,
      ]),
    []
  );

  const visibleSections = activeSection === "overview" ? sections.slice(1).map((section) => section.id) : [activeSection];

  return (
    <main className="min-h-screen bg-cream pt-[72px]">
      <section className="bg-brown-dark px-[5%] py-10 text-white">
        <div className="flex flex-col gap-8">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <span className="mb-3 inline-block rounded-full border border-gold/40 px-4 py-1 text-[0.72rem] uppercase tracking-[0.18em] text-gold-light">
                SahaServe Admin
              </span>
              <h1 className="font-['Cormorant_Garamond'] text-[clamp(2.2rem,5vw,3.8rem)] font-bold leading-tight">
                Dashboard <em className="not-italic text-gold-light">Control</em>
              </h1>
              <p className="mt-2 max-w-[620px] text-[0.94rem] text-white/65">
                A working mockup for users, orders, reservations, tables, menu, reviews, roles, and permissions.
              </p>
            </div>
            <div className="flex gap-3">
              <button className="btn btn-gold">
                <i className="fas fa-sync-alt text-[0.75rem]"></i>
                Refresh
              </button>
              <button className="btn bg-white/10 text-white hover:bg-white/15">
                <i className="fas fa-download text-[0.75rem]"></i>
                Export
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => (
              <div key={metric.label} className="rounded-[16px] border border-white/10 bg-white/[0.06] p-5">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-[0.76rem] uppercase tracking-[0.14em] text-white/55">{metric.label}</span>
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/15 text-gold-light">
                    <i className={`fas ${metric.icon}`}></i>
                  </span>
                </div>
                <div className="font-['Cormorant_Garamond'] text-[2rem] font-bold leading-none">{metric.value}</div>
                <div className="mt-2 text-[0.8rem] text-white/55">{metric.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="sticky top-[72px] z-[80] border-b border-[rgba(200,146,42,0.14)] bg-[rgba(250,245,236,0.96)] px-[5%] py-3 shadow-[0_4px_20px_rgba(26,15,0,0.06)] backdrop-blur-md">
        <div className="flex gap-2 overflow-x-auto scrollbar-none">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-[0.8rem] font-semibold transition-all ${
                activeSection === section.id
                  ? "border-gold bg-gold text-white shadow-[0_3px_12px_rgba(200,146,42,0.28)]"
                  : "border-beige bg-white text-text-mid hover:border-gold hover:text-gold"
              }`}
            >
              <i className={`fas ${section.icon} text-[0.75rem]`}></i>
              {section.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-[5%] py-10">
        {activeSection === "overview" && (
          <section className="mb-10 grid grid-cols-1 gap-6 xl:grid-cols-[1.35fr_0.65fr]">
            <AdminCard className="p-6">
              <SectionHeader eyebrow="Live Flow" title="Recent Orders" />
              <div className="mt-5">
                <SimpleTable columns={["Order", "Customer", "Items", "Total", "Status"]} rows={orderRows} />
              </div>
            </AdminCard>
            <AdminCard className="p-6">
              <SectionHeader eyebrow="Tonight" title="Reservation Queue" />
              <div className="mt-5 flex flex-col gap-3">
                {reservations.map((reservation) => (
                  <div key={`${reservation.guest}-${reservation.time}`} className="rounded-[12px] border border-beige bg-cream/70 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <strong className="text-[0.9rem] text-brown-dark">{reservation.guest}</strong>
                      <StatusBadge value={reservation.status} />
                    </div>
                    <p className="mt-1 text-[0.82rem] text-text-mid">{reservation.table} · {reservation.date} · {reservation.time}</p>
                  </div>
                ))}
              </div>
            </AdminCard>
          </section>
        )}

        <div className="grid grid-cols-1 gap-8">
          {visibleSections.includes("users") && (
            <AdminCard className="p-6">
              <SectionHeader eyebrow="Access" title="Users Management" action="Add Staff" />
              <div className="mt-5">
                <SimpleTable
                  columns={["Name", "Email", "Role", "Phone"]}
                  rows={users.map((user) => [
                    <strong className="text-brown-dark">{user.name}</strong>,
                    user.email,
                    <span className="rounded-full bg-gold-pale px-3 py-1 text-[0.72rem] font-semibold capitalize text-gold">{user.role}</span>,
                    user.phone,
                  ])}
                />
              </div>
            </AdminCard>
          )}

          {visibleSections.includes("orders") && (
            <AdminCard className="p-6">
              <SectionHeader eyebrow="Kitchen" title="Orders Management" action="Create Order" />
              <div className="mt-5">
                <SimpleTable columns={["Order", "Customer", "Items", "Total", "Status"]} rows={orderRows} />
              </div>
            </AdminCard>
          )}

          {visibleSections.includes("reservations") && (
            <AdminCard className="p-6">
              <SectionHeader eyebrow="Dining Room" title="Reservations Management" action="New Booking" />
              <div className="mt-5">
                <SimpleTable
                  columns={["Guest", "Table", "Date", "Time", "Status"]}
                  rows={reservations.map((reservation) => [
                    <strong className="text-brown-dark">{reservation.guest}</strong>,
                    reservation.table,
                    reservation.date,
                    reservation.time,
                    <StatusBadge value={reservation.status} />,
                  ])}
                />
              </div>
            </AdminCard>
          )}

          {visibleSections.includes("tables") && (
            <AdminCard className="p-6">
              <SectionHeader eyebrow="Floor Plan" title="Tables Management" action="Add Table" />
              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                {tables.map((table) => (
                  <div key={table.number} className="rounded-[14px] border border-beige bg-cream/70 p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <strong className="text-brown-dark">{table.name}</strong>
                        <p className="text-[0.82rem] text-text-mid">No. {table.number} · {table.capacity} seats</p>
                      </div>
                      <StatusBadge value={table.available ? "available" : "hidden"} />
                    </div>
                  </div>
                ))}
              </div>
            </AdminCard>
          )}

          {visibleSections.includes("menu") && (
            <AdminCard className="p-6">
              <SectionHeader eyebrow="Menu" title="Dishes, Categories & Tags" action="Add Dish" />
              <div className="mt-5 grid grid-cols-1 gap-6 xl:grid-cols-3">
                <div className="xl:col-span-2">
                  <SimpleTable
                    columns={["Dish", "Category", "Price", "Status"]}
                    rows={dishes.map((dish) => [
                      <strong className="text-brown-dark">{dish.name}</strong>,
                      dish.category,
                      dish.price,
                      <StatusBadge value={dish.status} />,
                    ])}
                  />
                </div>
                <div className="grid gap-4">
                  {[["Categories", categories], ["Tags", tags]].map(([title, items]) => (
                    <div key={title} className="rounded-[14px] border border-beige bg-cream/70 p-5">
                      <h3 className="mb-3 font-semibold text-brown-dark">{title}</h3>
                      <div className="flex flex-col gap-2">
                        {items.map((item) => (
                          <div key={item.name} className="flex items-center justify-between text-[0.84rem] text-text-mid">
                            <span>{item.name}</span>
                            <strong className="text-gold">{item.items || item.usage}</strong>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </AdminCard>
          )}

          {visibleSections.includes("reviews") && (
            <AdminCard className="p-6">
              <SectionHeader eyebrow="Moderation" title="Reviews Management" />
              <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
                {reviews.map((review) => (
                  <div key={`${review.dish}-${review.user}`} className="rounded-[14px] border border-beige bg-cream/70 p-5">
                    <div className="mb-2 flex items-center justify-between">
                      <strong className="text-brown-dark">{review.dish}</strong>
                      <span className="text-gold">{"★".repeat(review.rating)}</span>
                    </div>
                    <p className="text-[0.86rem] text-text-mid">"{review.comment}"</p>
                    <p className="mt-3 text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-text-mid">{review.user}</p>
                  </div>
                ))}
              </div>
            </AdminCard>
          )}

          {visibleSections.includes("ai-services") && (
            <AdminCard className="p-6">
              <SectionHeader eyebrow="AI Services" title="Review Analysis Results" />
              <div className="mt-5 grid grid-cols-1 gap-5">
                {reviewAnalyses.map((analysis, index) => (
                  <div key={`${analysis.sentiment}-${index}`} className="rounded-[16px] border border-beige bg-cream/70 p-5">
                    <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
                      <div className="max-w-[820px]">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <StatusBadge value={analysis.sentiment} />
                          <span className="rounded-full border border-beige bg-white px-3 py-1 text-[0.72rem] font-semibold text-text-mid">
                            Confidence {(analysis.confidence * 100).toFixed(0)}%
                          </span>
                          <span className="rounded-full border border-beige bg-white px-3 py-1 text-[0.72rem] font-semibold text-text-mid">
                            {analysis.category}
                          </span>
                        </div>
                        <p className="text-[0.9rem] leading-7 text-brown-dark">"{analysis.review}"</p>
                      </div>
                      <div className="min-w-[180px]">
                        <SeverityMeter score={analysis.severity_score} />
                      </div>
                    </div>

                    <AspectGrid aspects={analysis.aspects} />

                    <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-[0.85fr_1.15fr]">
                      <div className="rounded-[14px] border border-beige bg-white p-5">
                        <h3 className="mb-3 text-[0.82rem] font-bold uppercase tracking-[0.14em] text-text-mid">Key Points</h3>
                        <div className="flex flex-col gap-2">
                          {analysis.key_points.map((point) => (
                            <div key={point} className="flex items-start gap-3 text-[0.86rem] text-text-mid">
                              <i className="fas fa-check-circle mt-1 text-gold"></i>
                              <span>{point}</span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 rounded-[12px] bg-gold-pale p-4 text-[0.85rem] text-brown-dark">
                          <strong>Main issue:</strong> {analysis.main_issue || "No primary complaint detected"}
                        </div>
                      </div>

                      <div className="rounded-[14px] border border-beige bg-white p-5">
                        <h3 className="mb-3 text-[0.82rem] font-bold uppercase tracking-[0.14em] text-text-mid">Business Insight</h3>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div>
                            <div className="mb-1 text-[0.76rem] font-bold uppercase tracking-[0.12em] text-gold">Main Problem</div>
                            <p className="text-[0.86rem] leading-6 text-text-mid">{analysis.business_insight.main_problem}</p>
                          </div>
                          <div>
                            <div className="mb-1 text-[0.76rem] font-bold uppercase tracking-[0.12em] text-gold">Recommendation</div>
                            <p className="text-[0.86rem] leading-6 text-text-mid">{analysis.business_insight.recommendation}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </AdminCard>
          )}

          {visibleSections.includes("roles") && (
            <AdminCard className="p-6">
              <SectionHeader eyebrow="Security" title="Roles & Permissions" />
              <div className="mt-5">
                <SimpleTable
                  columns={["Role", "Permissions"]}
                  rows={roles.map((role) => [
                    <strong className="capitalize text-brown-dark">{role.role}</strong>,
                    role.permissions,
                  ])}
                />
              </div>
            </AdminCard>
          )}
        </div>
      </div>
    </main>
  );
};

export default DashboardPage;
