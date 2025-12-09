import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import JobCard from "./JobCard";
import "./SeekerFindJobsPage.css";
import { getAllJobs } from "../../service/api";
import SeekerMapPicker from "./SeekerMapPicker";

const jobTypes = [
  "Full Time",
  "Part Time",
  "One-Day Job",
  "Weekend Job",
  "Evening Job",
  "Monthly Job",
  "Urgent / Today Only Job",
];

const tags = [
  "Catering",
  "Ice Cream Shops",
  "Retail / General Stores",
  "Showrooms",
  "Events",
  "Hotels / Restaurants",
  "Delivery",
];

const salaryRanges = [
  "Less than ₹350",
  "Less than ₹500",
  "Less than ₹700",
  "Less than ₹1000",
];

const normalize = (str) =>
  str.toLowerCase().replace(/[^a-z0-9]/g, "");

function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/* ---------------- Filter Panel ---------------- */
const FilterPanel = ({ filters, setFilters }) => {
  const handleFilterChange = (group, item) =>
    setFilters((prev) => ({
      ...prev,
      [group]: prev[group].includes(item)
        ? prev[group].filter((i) => i !== item)
        : [...prev[group], item],
    }));

  const FilterGroup = ({ title, groupKey, items }) => (
    <div className="filter-group">
      <h4 className="filter-group-title">{title}</h4>
      <div className="filter-options-list">
        {items.map((item) => (
          <div key={item} className="d-flex align-items-center mb-1">
            <input
              id={`${groupKey}-${item}`}
              type="checkbox"
              checked={filters[groupKey].includes(item)}
              onChange={() => handleFilterChange(groupKey, item)}
              className="form-check-input filter-checkbox"
            />
            <label htmlFor={`${groupKey}-${item}`} className="filter-checkbox-label">
              {item}
            </label>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="panel-card">
      <h3 className="panel-header-title filter">Filters</h3>
      <FilterGroup title="Job Type" groupKey="jobType" items={jobTypes} />
      <FilterGroup title="Tags" groupKey="tags" items={tags} />
      <FilterGroup title="Salary Range" groupKey="salary" items={salaryRanges} />
    </div>
  );
};

/* ---------------- Search + Map Panel ---------------- */
const SearchMapPanel = ({
  searchTerm,
  setSearchTerm,
  radius,
  setRadius,
  location,
  setLocation,
  filteredJobs,
}) => {
  const navigate = useNavigate();

  const searchLocation = async () => {
    if (!location?.searchText) return;

    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        location.searchText
      )}`;

      const res = await fetch(url);
      const data = await res.json();

      if (data.length > 0) {
        const place = data[0];

        setLocation({
          lat: parseFloat(place.lat),
          lng: parseFloat(place.lon),
          searchText: location.searchText,
        });
      } else {
        alert("Location not found!");
      }
    } catch (err) {
      console.error("Location search error:", err);
    }
  };

  return (
    <div className="search-panel-container">
      <div className="panel-card">
        <div className="search-input-wrapper">
          <input
            type="text"
            placeholder="Search jobs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-control-base search-input"
          />
          <button className="search-btn">Search</button>
        </div>

        <button
          onClick={() => navigate("/jobs/applied")}
          className="applied-button"
        >
          Applied Jobs
        </button>
      </div>

      <div className="bottom-panel-content">
        <div className="panel-card mt-3">
          <label className="form-label mb-1">Customize Search Radius (km)</label>
          <input
            type="number"
            value={radius || ""}
            onChange={(e) => setRadius(Number(e.target.value))}
            className="form-control-base radius-input-small"
          />
        </div>

        {/* SEARCH ABOVE MAP */}
        <div className="panel-card mt-3">
          <div className="location-search-wrapper">
            <input
              type="text"
              placeholder="Search location..."
              value={location?.searchText || ""}
              onChange={(e) =>
                setLocation((prev) => ({ ...prev, searchText: e.target.value }))
              }
              onKeyDown={(e) => e.key === "Enter" && searchLocation()}
              className="form-control-base"
            />

            <button className="search-location-btn" onClick={searchLocation}>
              Search
            </button>
          </div>
        </div>

        <div className="map-area mt-3">
          <SeekerMapPicker
            location={location}
            setLocation={setLocation}
            jobPins={filteredJobs}
          />
        </div>
      </div>
    </div>
  );
};

/* ---------------- Main Page ---------------- */
const SeekerFindJobsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [radius, setRadius] = useState(0);

  const [location, setLocation] = useState({
    lat: null,
    lng: null,
    searchText: "",
  });

  const [filters, setFilters] = useState({
    jobType: [],
    tags: [],
    salary: [],
  });

  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);

  /* ---------------- Load from API when filters or search changes ---------------- */
  useEffect(() => {
    const loadJobs = async () => {
      try {
        const params = {
          search: searchTerm || undefined,
          type:
            filters.jobType.length === 1
              ? filters.jobType[0]
              : undefined,
          salary:
            filters.salary.length === 1
              ? filters.salary[0].replace(/\D/g, "")
              : undefined,
          city: undefined,
        };

        const res = await getAllJobs(params);
        setJobs(res.data);
      } catch (err) {
        console.error("Failed to load jobs:", err);
      }
    };

    loadJobs();
  }, [searchTerm, filters.jobType, filters.salary]);

  /* ---------------- Apply frontend-only filters (tags + radius + description search) ---------------- */
  useEffect(() => {
    let updated = [...jobs];

    if (filters.tags.length > 0) {
      updated = updated.filter((job) =>
        filters.tags.some((tag) =>
          (job.description || "").toLowerCase().includes(tag.toLowerCase())
        )
      );
    }

    if (Number(radius) > 0 && location.lat && location.lng) {
      updated = updated.filter((job) => {
        if (!job.latitude || !job.longitude) return false;
        const dist = getDistanceKm(
          location.lat,
          location.lng,
          job.latitude,
          job.longitude
        );
        return dist <= radius;
      });
    }

    setFilteredJobs(updated);
  }, [jobs, filters.tags, radius, location]);

  return (
    <div className="find-jobs-page bg-light-gray">
      <Header title="Find Your Job" />

      <main className="main-content-grid container-fluid">
        {/* MOBILE */}
        <div className="d-lg-none mobile-stack-container mb-4">
          <SearchMapPanel
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            radius={radius}
            setRadius={setRadius}
            location={location}
            setLocation={setLocation}
            filteredJobs={filteredJobs}
          />
          <FilterPanel filters={filters} setFilters={setFilters} />
        </div>

        {/* DESKTOP */}
        <div className="main-row">
          <aside className="d-none d-lg-block left-col">
            <FilterPanel filters={filters} setFilters={setFilters} />
          </aside>

          <section className="middle-col">
            <div className="middle-scroll">
              <h2 className="listings-header">
                {filteredJobs.length} Job Listings Found
              </h2>

              <div className="job-listings-grid-layout jobs-list">
                {filteredJobs.length > 0 ? (
                  filteredJobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))
                ) : (
                  <p className="text-center text-gray-600 py-5">
                    No jobs match your current filters.
                  </p>
                )}
              </div>
            </div>
          </section>

          <aside className="d-none d-lg-block right-col">
            <SearchMapPanel
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              radius={radius}
              setRadius={setRadius}
              location={location}
              setLocation={setLocation}
              filteredJobs={filteredJobs}
            />
          </aside>
        </div>
      </main>
    </div>
  );
};

export default SeekerFindJobsPage;
