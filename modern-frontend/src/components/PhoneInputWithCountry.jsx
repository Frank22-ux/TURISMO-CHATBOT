import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check, AlertCircle } from 'lucide-react';
import { countries } from '../data/countries';
import { parsePhoneNumberFromString, isValidPhoneNumber } from 'libphonenumber-js';

const PhoneInputWithCountry = ({ value, onChange, onValidationChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  // Set default to Ecuador
  const [selectedCountry, setSelectedCountry] = useState(
    countries.find(c => c.code === 'EC') || countries[0]
  );
  const [localNumber, setLocalNumber] = useState('');
  const [isValid, setIsValid] = useState(false);
  
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Handle click outside to close dropdown
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNumberChange = (e) => {
    const newNumber = e.target.value;
    setLocalNumber(newNumber);
    validateAndEmit(newNumber, selectedCountry);
  };

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setIsOpen(false);
    setSearchTerm('');
    validateAndEmit(localNumber, country);
  };

  const validateAndEmit = (number, country) => {
    const fullNumber = `${country.dialCode}${number}`;
    
    // Check validation
    let valid = false;
    try {
      const phoneNumber = parsePhoneNumberFromString(fullNumber, country.code);
      if (phoneNumber && phoneNumber.isValid()) {
        valid = true;
      }
    } catch (err) {
      valid = false;
    }

    setIsValid(valid);
    
    if (onValidationChange) {
      onValidationChange(valid);
    }
    
    if (onChange) {
      // Return full string or event-like object to parent
      onChange({ target: { name: 'phone', value: fullNumber } });
    }
  };

  const filteredCountries = countries.filter(country => 
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    country.dialCode.includes(searchTerm)
  );

  return (
    <div className="relative flex items-center w-full" ref={dropdownRef}>
      {/* Country Selector Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-4 bg-slate-100 hover:bg-slate-200 border border-slate-200 border-r-0 rounded-l-2xl transition-colors focus:outline-none"
      >
        <span className="text-xl leading-none">{selectedCountry.flag}</span>
        <span className="text-sm font-bold text-slate-700">{selectedCountry.dialCode}</span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Phone Number Input */}
      <div className="relative flex-1">
        <input
          type="tel"
          value={localNumber}
          onChange={handleNumberChange}
          placeholder="Número de teléfono..."
          className={`w-full pr-10 pl-4 py-4 rounded-r-2xl bg-slate-50 border ${isValid && localNumber.length > 0 ? 'border-green-400 focus:ring-green-400/20' : !isValid && localNumber.length > 0 ? 'border-red-400 focus:ring-red-400/20' : 'border-slate-100 focus:ring-primary/10'} focus:ring-4 outline-none transition-all`}
        />
        {localNumber.length > 0 && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {isValid ? (
              <Check className="w-5 h-5 text-green-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-500" />
            )}
          </div>
        )}
      </div>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transform">
          <div className="p-3 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                autoFocus
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar país o código..." 
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>
          <ul className="max-h-60 overflow-y-auto w-full">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country, idx) => (
                <li key={`${country.code}-${idx}`}>
                  <button
                    type="button"
                    onClick={() => handleCountrySelect(country)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{country.flag}</span>
                      <span className="text-sm font-medium text-slate-700">{country.name}</span>
                    </div>
                    <span className="text-sm font-bold text-slate-400">{country.dialCode}</span>
                  </button>
                </li>
              ))
            ) : (
              <li className="p-4 text-center text-sm text-slate-500">
                No se encontraron países
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PhoneInputWithCountry;
