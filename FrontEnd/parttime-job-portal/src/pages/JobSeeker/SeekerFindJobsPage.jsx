// pages/SeekerFindJobsPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import JobCard from "./JobCard";
import "./SeekerFindJobsPage.css";
import { getAllJobs } from "../../service/api";

// Filters
const jobTypes = [
  "Full Time",
  "Part Time",
  "One-Day Job",
  "Weekend Job",
  "Evening Job",
  "Monthly Job",
  "Urgent / Today Only Job"
];

const tags = [
  "Catering",
  "Ice Cream Shops",
  "Retail / General Stores",
  "Showrooms",
  "Events",
  "Hotels / Restaurants",
  "Delivery"
];

const salaryRanges = ["Less than ₹350", "Less than ₹500", "Less than ₹700", "Less than ₹1000"];

// Normalize text for matching
const normalize = (str) =>
  str.toLowerCase().replace(/[^a-z0-9]/g, ""); // removes spaces, hyphens, symbols

// FILTER PANEL
const FilterPanel = ({ filters, setFilters }) => {
  const handleFilterChange = (group, item) => {
    setFilters(prev => ({
      ...prev,
      [group]: prev[group].includes(item)
        ? prev[group].filter(i => i !== item)
        : [...prev[group], item],
    }));
  };

  const FilterGroup = ({ title, groupKey, items }) => (
    <div className="filter-group">
      <h4 className="filter-group-title">{title}</h4>
      <div className="filter-options-list">
        {items.map(item => (
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

// SEARCH + MAP PANEL
const SearchMapPanel = ({ searchTerm, setSearchTerm, setRadius }) => {
  const navigate = useNavigate();

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
          <span className="search-icon">🔍</span>
        </div>

        {/* ✔ Go to applied jobs */}
        <button
          onClick={() => navigate("/jobs/applied")}
          className="applied-button"
        >
          Applied Jobs
        </button>
      </div>

      <div className="bottom-panel-content">
        <div className="panel-card mt-3">
          <label htmlFor="radius" className="form-label mb-1">
            Customize Search Radius (km)
          </label>
          <input
            id="radius"
            type="number"
            placeholder="e.g., 10"
            onChange={(e) => setRadius(e.target.value)}
            className="form-control-base radius-input-small"
          />
        </div>

        <div className="map-area mt-3">
          <span className="text-gray-600">GOOGLE MAP (Pins update dynamically)</span>
        </div>
      </div>
    </div>
  );
};

// MAIN PAGE
const SeekerFindJobsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [radius, setRadius] = useState("");
  const [filters, setFilters] = useState({
    jobType: [],
    tags: [],
    salary: [],
  });
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);

  // LOAD JOBS
  useEffect(() => {
    const loadJobs = async () => {
      try {
        const res = await getAllJobs();
        setJobs(res.data);
      } catch (err) {
        console.error("Failed to load jobs:", err);
      }
    };
    loadJobs();
  }, []);

  // FILTER LOGIC (UPDATED)
  useEffect(() => {
    let updated = [...jobs];

    // ⬇ Search filter
    updated = updated.filter(job =>
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.city.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // ⬇ Job type filter (fixed)
    if (filters.jobType.length > 0) {
      updated = updated.filter(job =>
        filters.jobType.some(type =>
          normalize(type) === normalize(job.type)
        )
      );
    }

    // ⬇ Tags filter
    if (filters.tags.length > 0) {
      updated = updated.filter(job =>
        filters.tags.some(tag =>
          (job.description || "").toLowerCase().includes(tag.toLowerCase())
        )
      );
    }

    // ⬇ Salary filter
    if (filters.salary.length > 0) {
      updated = updated.filter(job => {
        const jobSalaryNum = parseInt(job.salary.replace(/\D/g, ""));
        return filters.salary.some(sal => {
          const limit = parseInt(sal.replace(/\D/g, ""));
          return jobSalaryNum <= limit;
        });
      });
    }

    setFilteredJobs(updated);
  }, [jobs, searchTerm, filters]);

  return (
    <div className="find-jobs-page bg-light-gray">
      <Header title="Find Your Job" />

      <main className="main-content-grid container-fluid">
        <div className="d-lg-none mobile-stack-container mb-4">
          <SearchMapPanel
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            setRadius={setRadius}
          />
          <FilterPanel filters={filters} setFilters={setFilters} />
        </div>

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
                  filteredJobs.map(job => (
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
              setRadius={setRadius}
            />
          </aside>
        </div>
      </main>
    </div>
  );
};

export default SeekerFindJobsPage;
