import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import JobCard from "./JobCard";
import "./SeekerFindJobsPage.css";
import { getAllJobs } from "../../service/api";
import SeekerMapPicker from "./SeekerMapPicker";

/* ---------------- Static Data ---------------- */

const jobTypes = [
  "Full Time",
  "Part Time",
  "Sigle-Day",
  "Weekend Job",
  "Evening Job",
  "Monthly Job",
  "Urgent",
];

const tags = [
  "Catering",
  "Ice Cream Shops",
  "Retail",
  "Showrooms",
  "Events",
  "Hotels",
  "Delivery",
];

const salaryRanges = [
  "Less than ₹350",
  "Less than ₹500",
  "Less than ₹700",
  "Less than ₹1000",
];

/* ---------------- Helpers ---------------- */

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

/* ---------------- Filter Panel (UNCHANGED) ---------------- */
const FilterPanel = ({ filters, setFilters }) => {
  const [openSections, setOpenSections] = useState({
    jobType: false,
    tags: false,
    salary: false,
  });

  const toggleSection = (key) => {
    setOpenSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleFilterChange = (group, item) =>
    setFilters((prev) => ({
      ...prev,
      [group]: prev[group].includes(item)
        ? prev[group].filter((i) => i !== item)
        : [...prev[group], item],
    }));

  const FilterGroup = ({ title, groupKey, items }) => (
    <div className="filter-accordion-group">
      <div
        className="filter-accordion-header"
        onClick={() => toggleSection(groupKey)}
      >
        <span>{title}</span>
        <span className="accordion-arrow">
          {openSections[groupKey] ? "∨" : ">"}
        </span>

      </div>

      {openSections[groupKey] && (
        <div className="filter-accordion-content">
          {items.map((item) => (
            <label key={item} className="filter-checkbox-row">
              <input
                type="checkbox"
                checked={filters[groupKey].includes(item)}
                onChange={() => handleFilterChange(groupKey, item)}
              />
              <span>{item}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="panel-card">
      <FilterGroup title="Job Type" groupKey="jobType" items={jobTypes} />
      <FilterGroup title="Tags" groupKey="tags" items={tags} />
      <FilterGroup
        title="Salary Range"
        groupKey="salary"
        items={salaryRanges}
      />
    </div>
  );
};



/* ---------------- Search + Map Panel (UNCHANGED) ---------------- */

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
        setLocation({
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          searchText: location.searchText,
        });
      }
    } catch (err) {
      console.error(err);
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
      </div>

      <div className="bottom-panel-content">
        <div className="panel-card mt-3">
          <input
            type="text"
            placeholder="Search location..."
            value={location.searchText}
            onChange={(e) =>
              setLocation((p) => ({ ...p, searchText: e.target.value }))
            }
          />
          <button className="search-location-btn" onClick={searchLocation}>
            Search
          </button>
        </div>

        <div className="panel-card mt-3">
          <label>Enter Km</label>
          <input
            type="number"
            value={radius}
            onChange={(e) => setRadius(e.target.value)}
            className="custom-ridus"
            placeholder=""
          />
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

/* ---------------- MAIN PAGE ---------------- */

const SeekerFindJobsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [radius, setRadius] = useState("");

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

  /* ✅ ONLY NEW STATE */
  const [showFilters, setShowFilters] = useState(false);

  /* Load jobs */
  useEffect(() => {
    const loadJobs = async () => {
      try {
        const params = {
          search: searchTerm || undefined,
          type: filters.jobType.length === 1 ? filters.jobType[0] : undefined,
          salary:
            filters.salary.length === 1
              ? filters.salary[0].replace(/\D/g, "")
              : undefined,
        };

        const res = await getAllJobs(params);
        setJobs(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    loadJobs();
  }, [searchTerm, filters.jobType, filters.salary]);

  /* Frontend filters */
  useEffect(() => {
    let updated = [...jobs];

    if (filters.tags.length > 0) {
      updated = updated.filter((job) =>
        filters.tags.some((tag) =>
          (job.description || "").toLowerCase().includes(tag.toLowerCase())
        )
      );
    }

   const radiusNum = Number(radius);

if (radiusNum > 0 && location.lat && location.lng) {

      updated = updated.filter((job) => {
        if (!job.latitude || !job.longitude) return false;
        return (
          getDistanceKm(
            location.lat,
            location.lng,
            job.latitude,
            job.longitude
          ) <= radiusNum
        );
      });
    }

    setFilteredJobs(updated);
  }, [jobs, filters.tags, radius, location]);

  return (
    <div className="find-jobs-page bg-light-gray">
      <Header title="Find Your Job" />
      
      <img
        src="/filter.jpg"
        alt="Filter"
        className="filters-icon"
        onClick={() => setShowFilters(true)}
      />


      {/* ✅ SLIDING FILTER COLUMN */}
      <div className={`filters-slide ${showFilters ? "open" : ""}`}>
        <div className="filters-header">
          <span>Filters</span>
          <button className="filters-close" onClick={() => setShowFilters(false)}>
            ✕
          </button>
        </div>

        <FilterPanel filters={filters} setFilters={setFilters} />
      </div>

      <main className="main-content-grid container-fluid">
        {/* MOBILE (UNCHANGED) */}
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
       <div className={`main-row ${showFilters ? "filter-open" : ""}`}>

          <section className="middle-col">
            <div className="middle-scroll">
              

              <div className="job-listings-grid-layout jobs-list">
                {filteredJobs.length > 0 ? (
                  filteredJobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))
                ) : (
                  <p className="text-center py-5">
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
