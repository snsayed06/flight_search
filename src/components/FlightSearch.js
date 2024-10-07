import React, { useState, useEffect, useRef } from 'react';
import Autosuggest from 'react-autosuggest';
import airports from 'airports-json'; // Ensure this is correctly installed and imported

const FlightSearch = () => {
  const [tripType, setTripType] = useState('Round trip');
  const [dropdownOpen, setDropdownOpen] = useState(null); // Controls which dropdown is open ('trip', 'passenger', 'class')
  const [flightClass, setFlightClass] = useState('Economy');

  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');

  const [suggestions, setSuggestions] = useState([]); // State for storing suggestions
  const [submittedData, setSubmittedData] = useState(null); // For displaying submitted form data

  // State for passenger counts
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infantsSeat, setInfantsSeat] = useState(0);
  const [infantsLap, setInfantsLap] = useState(0);

  // References to the dropdown containers
  const dropdownRef = useRef(null);

  useEffect(() => {
    console.log('Airports data:', airports); // Log the structure of airports-json
  }, []);

  // Filtering airports based on user input (showing top 5 results)
  const getSuggestions = (value) => {
    if (!value) return [];

    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;

    console.log('Fetching suggestions for:', value); // Debugging log for input value

    // Access the 'airports' array inside the main object
    const airportList = airports.airports; // Access the correct array of airports

    return inputLength === 0
      ? []
      : airportList
          .filter(
            (airport) =>
              (airport.iata && airport.iata.toLowerCase().startsWith(inputValue)) || // Improved IATA search using 'startsWith'
              (airport.name && airport.name.toLowerCase().includes(inputValue)) || // Keep partial match for airport name
              (airport.city && airport.city.toLowerCase().includes(inputValue))    // Keep partial match for city name
          )
          .slice(0, 5); // Limit to top 5 results
  };

  // Autosuggest will call this function every time user types
  const onSuggestionsFetchRequested = ({ value }) => {
    console.log('Input received for suggestions:', value); // Debugging log for suggestions input
    const newSuggestions = getSuggestions(value);
    console.log('Suggestions found:', newSuggestions); // Debugging log for found suggestions
    setSuggestions(newSuggestions); // Update the suggestions state
  };

  // When user selects a suggestion
  const onSuggestionSelected = (event, { suggestion, method }, type) => {
    console.log('Selected suggestion:', suggestion); // Debugging log for selected suggestion
    if (type === 'from') {
      setFromLocation(`${suggestion.iata} - ${suggestion.name}`);
    } else {
      setToLocation(`${suggestion.iata} - ${suggestion.name}`);
    }
  };

  // Autosuggest will call this function to clear suggestions when the user has no input
  const onSuggestionsClearRequested = () => {
    setSuggestions([]); // Clear suggestions
  };

  // Input props for the "From" field
  const inputPropsFrom = {
    placeholder: 'From (e.g., LAX, JFK)',
    value: fromLocation,
    onChange: (event, { newValue }) => setFromLocation(newValue),
    className: 'w-full p-2 bg-gray-900 text-white rounded-md focus:outline-none',
  };

  // Input props for the "To" field
  const inputPropsTo = {
    placeholder: 'To (e.g., LAX, JFK)',
    value: toLocation,
    onChange: (event, { newValue }) => setToLocation(newValue),
    className: 'w-full p-2 bg-gray-900 text-white rounded-md focus:outline-none',
  };

  // Render the suggestion
  const renderSuggestion = (suggestion) => (
    <div>
      {suggestion.iata} - {suggestion.name} ({suggestion.city}, {suggestion.country})
    </div>
  );

  // Function to switch "From" and "To" locations
  const switchLocations = () => {
    const temp = fromLocation;
    setFromLocation(toLocation);
    setToLocation(temp);
  };

  // Handle passenger count changes
  const handlePassengerChange = (type, operation) => {
    if (type === 'adults') {
      setAdults(operation === 'increment' ? adults + 1 : Math.max(1, adults - 1));
    } else if (type === 'children') {
      setChildren(operation === 'increment' ? children + 1 : Math.max(0, children - 1));
    } else if (type === 'infantsSeat') {
      setInfantsSeat(operation === 'increment' ? infantsSeat + 1 : Math.max(0, infantsSeat - 1));
    } else if (type === 'infantsLap') {
      setInfantsLap(operation === 'increment' ? infantsLap + 1 : Math.max(0, infantsLap - 1));
    }
  };

  // Dropdown toggle functions
  const toggleDropdown = (dropdown) => {
    setDropdownOpen(dropdownOpen === dropdown ? null : dropdown);
  };

  // Handle class selection
  const handleClassSelect = (selectedClass) => {
    setFlightClass(selectedClass);
    setDropdownOpen(null); // Close the dropdown
  };

  // Handle clicks outside the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(null); // Close dropdown if clicked outside
      }
    };

    // Add event listener to detect outside clicks
    document.addEventListener('mousedown', handleClickOutside);

    // Cleanup the event listener on component unmount
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  // Function to handle form submission and display data
  const handleSubmit = () => {
    const formData = {
      tripType,
      fromLocation,
      toLocation,
      departureDate,
      returnDate,
      flightClass,
      passengers: {
        adults,
        children,
        infantsSeat,
        infantsLap
      }
    };

    setSubmittedData(formData); // Set the form data for display
  };

  return (
    <div className="bg-gray-800 text-white p-6 rounded-lg shadow-md max-w-4xl mx-auto">
      <div className="flex space-x-4" ref={dropdownRef}>
        {/* Trip Type Dropdown */}
        <div className="relative">
          <button
            onClick={() => toggleDropdown('trip')}
            className="bg-gray-700 px-4 py-2 rounded-md flex items-center justify-between w-36"
          >
            <span>{tripType}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 transform transition-transform ${
                dropdownOpen === 'trip' ? 'rotate-180' : 'rotate-0'
              }`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          {dropdownOpen === 'trip' && (
            <ul className="absolute bg-gray-700 text-white mt-2 rounded-md shadow-lg w-full z-10">
              <li
                onClick={() => {
                  setTripType('Round trip');
                  setDropdownOpen(null);
                }}
                className={`p-2 cursor-pointer ${tripType === 'Round trip' ? 'bg-gray-600' : ''}`}
              >
                Round trip
              </li>
              <li
                onClick={() => {
                  setTripType('One way');
                  setDropdownOpen(null);
                }}
                className={`p-2 cursor-pointer ${tripType === 'One way' ? 'bg-gray-600' : ''}`}
              >
                One way
              </li>
              <li
                onClick={() => {
                  setTripType('Multi-city');
                  setDropdownOpen(null);
                }}
                className={`p-2 cursor-pointer ${tripType === 'Multi-city' ? 'bg-gray-600' : ''}`}
              >
                Multi-city
              </li>
            </ul>
          )}
        </div>

        {/* Passenger Selection Dropdown */}
        <div className="relative">
          <button
            onClick={() => toggleDropdown('passenger')}
            className="bg-gray-700 px-4 py-2 rounded-md flex items-center justify-between w-24"
          >
            <span>{adults + children + infantsSeat + infantsLap}</span>
            <span className="ml-2">👤</span>
          </button>
          {dropdownOpen === 'passenger' && (
            <div className="absolute bg-gray-700 text-white mt-2 rounded-md shadow-lg w-64 p-4 z-10">
              {/* Adults */}
              <div className="flex justify-between items-center mb-2">
                <span>Adults</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePassengerChange('adults', 'decrement')}
                    className="bg-gray-600 px-2 rounded-md"
                  >
                    -
                  </button>
                  <span>{adults}</span>
                  <button
                    onClick={() => handlePassengerChange('adults', 'increment')}
                    className="bg-gray-600 px-2 rounded-md"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Children */}
              <div className="flex justify-between items-center mb-2">
                <span>Children (2-11)</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePassengerChange('children', 'decrement')}
                    className="bg-gray-600 px-2 rounded-md"
                  >
                    -
                  </button>
                  <span>{children}</span>
                  <button
                    onClick={() => handlePassengerChange('children', 'increment')}
                    className="bg-gray-600 px-2 rounded-md"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Infants In Seat */}
              <div className="flex justify-between items-center mb-2">
                <span>Infants (in seat)</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePassengerChange('infantsSeat', 'decrement')}
                    className="bg-gray-600 px-2 rounded-md"
                  >
                    -
                  </button>
                  <span>{infantsSeat}</span>
                  <button
                    onClick={() => handlePassengerChange('infantsSeat', 'increment')}
                    className="bg-gray-600 px-2 rounded-md"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Infants On Lap */}
              <div className="flex justify-between items-center mb-2">
                <span>Infants (on lap)</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePassengerChange('infantsLap', 'decrement')}
                    className="bg-gray-600 px-2 rounded-md"
                  >
                    -
                  </button>
                  <span>{infantsLap}</span>
                  <button
                    onClick={() => handlePassengerChange('infantsLap', 'increment')}
                    className="bg-gray-600 px-2 rounded-md"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Done and Cancel Buttons */}
              <div className="flex justify-between mt-4">
                <button onClick={() => setDropdownOpen(null)} className="text-blue-400">
                  Cancel
                </button>
                <button onClick={() => setDropdownOpen(null)} className="text-blue-400">
                  Done
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Class Dropdown */}
        <div className="relative">
          <button
            onClick={() => toggleDropdown('class')}
            className="bg-gray-700 px-4 py-2 rounded-md flex items-center justify-between w-36"
            style={{ width: '200px', whiteSpace: 'nowrap' }}
          >
            <span>{flightClass}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 transform transition-transform ${
                dropdownOpen === 'class' ? 'rotate-180' : 'rotate-0'
              }`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          {dropdownOpen === 'class' && (
            <ul className="absolute bg-gray-700 text-white mt-2 rounded-md shadow-lg w-full z-10">
              <li
                onClick={() => handleClassSelect('Economy')}
                className={`p-2 cursor-pointer ${flightClass === 'Economy' ? 'bg-gray-600' : ''}`}
              >
                Economy
              </li>
              <li
                onClick={() => handleClassSelect('Premium economy')}
                className={`p-2 cursor-pointer ${
                  flightClass === 'Premium economy' ? 'bg-gray-600' : ''
                }`}
                style={{ whiteSpace: 'nowrap' }}
              >
                Premium economy
              </li>
              <li
                onClick={() => handleClassSelect('Business')}
                className={`p-2 cursor-pointer ${flightClass === 'Business' ? 'bg-gray-600' : ''}`}
              >
                Business
              </li>
              <li
                onClick={() => handleClassSelect('First')}
                className={`p-2 cursor-pointer ${flightClass === 'First' ? 'bg-gray-600' : ''}`}
              >
                First
              </li>
            </ul>
          )}
        </div>
      </div>

      {/* Flight Search Fields with Switch Button */}
      <div className="flex space-x-4 mt-4 items-center">
        {/* Departure Input */}
        <div className="flex-1">
          <label className="block text-sm mb-2">From</label>
          <Autosuggest
            suggestions={suggestions}
            onSuggestionsFetchRequested={onSuggestionsFetchRequested} // Update suggestions on input
            onSuggestionsClearRequested={onSuggestionsClearRequested} // Clear suggestions when input is empty
            onSuggestionSelected={(event, data) => onSuggestionSelected(event, data, 'from')}
            getSuggestionValue={(suggestion) => suggestion.iata}
            renderSuggestion={renderSuggestion}
            inputProps={inputPropsFrom} // Pass inputProps with className
          />
        </div>

        {/* Switch Button */}
        <button
          onClick={switchLocations}
          className="bg-gray-700 px-2 py-1 rounded-full text-white transform hover:rotate-180 transition duration-300"
        >
          ⟲
        </button>

        {/* Destination Input */}
        <div className="flex-1">
          <label className="block text-sm mb-2">To</label>
          <Autosuggest
            suggestions={suggestions}
            onSuggestionsFetchRequested={onSuggestionsFetchRequested} // Update suggestions on input
            onSuggestionsClearRequested={onSuggestionsClearRequested} // Clear suggestions when input is empty
            onSuggestionSelected={(event, data) => onSuggestionSelected(event, data, 'to')}
            getSuggestionValue={(suggestion) => suggestion.iata}
            renderSuggestion={renderSuggestion}
            inputProps={inputPropsTo} // Pass inputProps with className
          />
        </div>
      {/* </div> */}

      {/* Date Pickers */}
      {/* <div className="flex space-x-4 mt-4 items-center"> */}
        {/* Departure Date */}
        <div className="flex-1">
          <label className="block text-sm mb-2">Departure</label>
          <input
            type="date"
            value={departureDate}
            onChange={(e) => setDepartureDate(e.target.value)}
            min={today} // Restrict past dates
            className="w-full p-2 bg-gray-900 text-white rounded-md focus:outline-none"
          />
        </div>

        {/* Conditionally render Return Date */}
        {tripType !== 'One way' && tripType !== 'Multi-city' && (
          <div className="flex-1">
            <label className="block text-sm mb-2">Return</label>
            <input
              type="date"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              min={departureDate} // Ensure return date is after departure date
              className="w-full p-2 bg-gray-900 text-white rounded-md focus:outline-none"
            />
          </div>
        )}
      </div>
      

      {/* CTA Button */}
      <div className="mt-6">
        <button
          onClick={handleSubmit}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
        >
          Search Flights
        </button>
      </div>

      {/* Display Form Data After Submission */}
      {submittedData && (
        <div className="mt-6 p-4 bg-gray-700 rounded-md text-white">
          <h3 className="text-lg font-semibold mb-4">Flight Search Details</h3>
          <p><strong>Trip Type:</strong> {submittedData.tripType}</p>
          <p><strong>From:</strong> {submittedData.fromLocation}</p>
          <p><strong>To:</strong> {submittedData.toLocation}</p>
          <p><strong>Departure Date:</strong> {submittedData.departureDate}</p>
          {submittedData.tripType !== 'One way' && (
            <p><strong>Return Date:</strong> {submittedData.returnDate}</p>
          )}
          <p><strong>Flight Class:</strong> {submittedData.flightClass}</p>
          <p><strong>Passengers:</strong></p>
          <ul>
            <li>Adults: {submittedData.passengers.adults}</li>
            <li>Children: {submittedData.passengers.children}</li>
            <li>Infants in Seat: {submittedData.passengers.infantsSeat}</li>
            <li>Infants on Lap: {submittedData.passengers.infantsLap}</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default FlightSearch;
