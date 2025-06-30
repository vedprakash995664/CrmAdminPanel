import React, { useState } from 'react';
import axios from 'axios';
import Dashboard from '../Components/Dashboard';

export default function Searching() {
  const APi_Url = import.meta.env.VITE_API_URL;
  const [searchQuery, setSearchQuery] = useState('');
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${APi_Url}/digicoder/crm/api/v1/lead/search?query=${searchQuery}`
      );
      setLeads(data.leads);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dashboard active='search'>
    <div className="search-container">
      <h2>🔍 Search Leads</h2>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Enter name, phone or email"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      {loading ? (
        <p className="loading-text">Searching...</p>
      ) : leads.length > 0 ? (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Tags</th>
                <th>Source</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead._id}>
                  <td>{lead.name}</td>
                  <td>{lead.phone}</td>
                  <td>
                    {lead.tags && lead.tags.length > 0
                      ? lead.tags.map((tag) => tag.tagName).join(', ')
                      : 'No Tags'}
                  </td>
                  <td>{lead.sources?.leadSourcesText || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="no-results">No leads found</p>
      )}

      <style jsx>{`
        .search-container {
          max-width: 100%;
          margin: 30px auto;
          padding: 20px;
          background: #f7f9fc;
          border-radius: 10px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        h2 {
          text-align: center;
          margin-bottom: 20px;
        }

        .search-bar {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          justify-content: center;
          margin-bottom: 20px;
        }

        .search-bar input {
          flex: 1;
          min-width: 250px;
          padding: 10px 15px;
          border: 1px solid #ccc;
          border-radius: 5px;
          font-size: 16px;
        }

        .search-bar button {
          padding: 10px 20px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-weight: bold;
        }

        .search-bar button:hover {
          background: #0056b3;
        }

        .loading-text,
        .no-results {
          text-align: center;
          color: #666;
          font-size: 18px;
          margin-top: 20px;
        }

        .table-wrapper {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          background-color: white;
          border-radius: 8px;
          overflow: hidden;
        }

        th, td {
          padding: 12px 15px;
          text-align: left;
          border-bottom: 1px solid #ddd;
        }

        th {
          background-color: #f0f4f8;
          font-weight: bold;
        }

        tr:hover {
          background-color: #f9f9f9;
        }

        @media (max-width: 600px) {
          .search-bar {
            flex-direction: column;
          }

          th, td {
            font-size: 14px;
            padding: 10px;
          }
        }
      `}</style>
    </div>
    </Dashboard>
  );
}
