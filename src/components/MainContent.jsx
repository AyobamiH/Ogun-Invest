


import React, { useState } from "react";


// Lists of states, countries and LGAs used to populate select elements.
const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "Gombe", "Imo", "Jigawa",
  "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger",
  "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe",
  "Zamfara", "FCT",
];

const COUNTRIES = [
  "Nigeria", "Ghana", "Kenya", "South Africa", "United Kingdom", "United States",
  "Germany", "France", "UAE", "India", "China", "Japan", "Singapore",
];

const OGUN_LGAS = [
  "Abeokuta North", "Abeokuta South", "Ado-Odo/Ota", "Ewekoro", "Ifo", "Ijebu East",
  "Ijebu North", "Ijebu North East", "Ijebu Ode", "Ikenne", "Imeko Afon", "Ipokia",
  "Obafemi Owode", "Odeda", "Odogbolu", "Ogun Waterside", "Remo North", "Sagamu",
  "Yewa North", "Yewa South",
];

const FACILITATION_OPTIONS = [
  "Title Documents",
  "Land Acquisition",
  "Permits",
  "Regulatory Approvals",
  "Others",
];

// Options for how the applicant heard about OgunInvest. These values must
// align exactly with the backend enumeration.
const HOW_HEARD_OPTIONS = [
  "Website",
  "Social media",
  "Referral",
  "Trade Fair/Summit",
  "Others",
];

/**
 * A fully functional version of the Ogun Invest KYC form.
 *
 * This component maintains internal state for all input fields to match
 * the backend payload shape provided by the user. On submission it
 * compiles the nested form data and sends a POST request to the given
 * webhook endpoint. No request is executed until the user actually
 * submits the form. If required, you can add a confirmation step before
 * triggering the fetch call.
 */
const InvestogunForm = () => {
  const today = new Date().toISOString().split("T")[0];
  // Initialise the form state with nested structures.
  const [formData, setFormData] = useState({
    // Investor status: either "existing" or "new". This captures the top
    // radio selection indicating whether the investor is already operating in
    // Ogun State or not.
    investor_status: "",
    company: {
      name_or_promoter: "",
      cac_registered: false,
      // RC number (CAC registration number). This field is included when
      // `cac_registered` is true and will be sent in the payload. If not
      // applicable, it remains an empty string. Some backend schemas may
      // ignore this property if absent.
      rc_number: "",
      registered_address: "",
      country_of_incorporation: "",
      business_location: { country: "", state_nigeria: "" },
      sector_industry: "",
      company_email: "",
      // Pre-fill the website field with https:// to guide non-technical users.
      company_website: "https://",
    },
    contacts: {
      md_ceo: {
        surname: "",
        first_name: "",
        other_names: "",
        nationality: "",
        mobile: "",
        email: "",
      },
      directors: ["", "", "", "", ""],
      share_capitalization_amount: "",
      shareholders: [
        { name: "", nationality: "", percent: "" },
        { name: "", nationality: "", percent: "" },
        { name: "", nationality: "", percent: "" },
        { name: "", nationality: "", percent: "" },
        { name: "", nationality: "", percent: "" },
      ],
    },
    project: {
      overview: "",
      sector: "",
      total_value_usd: "",
      location_lga: "",
      jobs_direct: "",
      jobs_indirect: "",
      project_commencement_date: "",
      operations_commencement_date: "",
      phases: {
        year1_initial: "",
        year2: "",
        year3: "",
      },
      raw_materials: [
        { material: "", source: "" },
        { material: "", source: "" },
        { material: "", source: "" },
        { material: "", source: "" },
      ],
      technical_partners: [
        { name: "", country_of_origin: "", website: "" },
        { name: "", country_of_origin: "", website: "" },
        { name: "", country_of_origin: "", website: "" },
      ],
    },
    facilitation_services: {
      services: [],
      other_services_detail: "",
      how_heard: "",
      how_heard_other_detail: "",
      motivation: "",
    },
    declaration: {
      agreed: false,
      signer_name: "",
      designation_role: "",
      date: today,
      phone: "",
      email: "",
    },
    attachments: {
      business_plan_files: [],
      company_profile_files: [],
    },
  });

  // Track submission status to provide user feedback. Possible values:
  // null (no submission yet), 'success', 'error'.
  const [submissionStatus, setSubmissionStatus] = useState(null);

  /* ---------------------- Handler functions ----------------------- */
  // Company field change handler
  const handleCompanyFieldChange = (field) => (e) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      company: { ...prev.company, [field]: value },
    }));
  };
  // CAC registered radio handler
  const handleCACRegisteredChange = (e) => {
    const isYes = e.target.value === "Yes";
    setFormData((prev) => ({
      ...prev,
      company: { ...prev.company, cac_registered: isYes },
    }));
  };
  // Business location (nested)
  const handleBusinessLocationChange = (field) => (e) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      company: {
        ...prev.company,
        business_location: {
          ...prev.company.business_location,
          [field]: value,
        },
      },
    }));
  };
  // MD/CEO details
  const handleMdCeoChange = (field) => (e) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      contacts: {
        ...prev.contacts,
        md_ceo: { ...prev.contacts.md_ceo, [field]: value },
      },
    }));
  };
  // Directors list
  const handleDirectorChange = (index) => (e) => {
    const value = e.target.value;
    setFormData((prev) => {
      const directors = [...prev.contacts.directors];
      directors[index] = value;
      return {
        ...prev,
        contacts: { ...prev.contacts, directors },
      };
    });
  };

  // Add a new director row
  const addDirector = () => {
    setFormData((prev) => ({
      ...prev,
      contacts: {
        ...prev.contacts,
        directors: [...prev.contacts.directors, ""],
      },
    }));
  };
  // Remove a director by index
  const removeDirector = (index) => () => {
    setFormData((prev) => {
      const directors = prev.contacts.directors.filter((_, idx) => idx !== index);
      return {
        ...prev,
        contacts: { ...prev.contacts, directors },
      };
    });
  };
  // Share capitalization amount
  const handleShareCapAmountChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      contacts: { ...prev.contacts, share_capitalization_amount: value },
    }));
  };
  // Shareholders table
  const handleShareholderChange = (index, field) => (e) => {
    const value = e.target.value;
    setFormData((prev) => {
      const shareholders = prev.contacts.shareholders.map((item, idx) => {
        if (idx !== index) return item;
        // If the field being updated is 'percentage', rename it to 'percent'
        if (field === "percentage") {
          return { ...item, percent: value };
        }
        return { ...item, [field]: value };
      });
      return {
        ...prev,
        contacts: { ...prev.contacts, shareholders },
      };
    });
  };

  // Add a new shareholder row
  const addShareholder = () => {
    setFormData((prev) => ({
      ...prev,
      contacts: {
        ...prev.contacts,
        shareholders: [
          ...prev.contacts.shareholders,
          { name: "", nationality: "", percentage: "" },
        ],
      },
    }));
  };
  // Remove a shareholder by index
  const removeShareholder = (index) => () => {
    setFormData((prev) => {
      const shareholders = prev.contacts.shareholders.filter((_, idx) => idx !== index);
      return {
        ...prev,
        contacts: { ...prev.contacts, shareholders },
      };
    });
  };
  // Project field change
  const handleProjectFieldChange = (field) => (e) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      project: { ...prev.project, [field]: value },
    }));
  };
  // Raw materials table
  const handleRawMaterialChange = (index, field) => (e) => {
    const value = e.target.value;
    setFormData((prev) => {
      const raw_materials = prev.project.raw_materials.map((item, idx) =>
        idx === index ? { ...item, [field]: value } : item
      );
      return {
        ...prev,
        project: { ...prev.project, raw_materials },
      };
    });
  };

  // Add a new raw material row
  const addRawMaterial = () => {
    setFormData((prev) => ({
      ...prev,
      project: {
        ...prev.project,
        raw_materials: [...prev.project.raw_materials, { material: "", source: "" }],
      },
    }));
  };
  // Remove a raw material by index
  const removeRawMaterial = (index) => () => {
    setFormData((prev) => {
      const raw_materials = prev.project.raw_materials.filter((_, idx) => idx !== index);
      return {
        ...prev,
        project: { ...prev.project, raw_materials },
      };
    });
  };
  // Technical partners table
  const handlePartnerChange = (index, field) => (e) => {
    const value = e.target.value;
    setFormData((prev) => {
      const technical_partners = prev.project.technical_partners.map((item, idx) =>
        idx === index ? { ...item, [field]: value } : item
      );
      return {
        ...prev,
        project: { ...prev.project, technical_partners },
      };
    });
  };

  // Add a new technical partner row
  const addPartner = () => {
    setFormData((prev) => ({
      ...prev,
      project: {
        ...prev.project,
        technical_partners: [
          ...prev.project.technical_partners,
          { name: "", country_of_origin: "", website: "" },
        ],
      },
    }));
  };
  // Remove a technical partner by index
  const removePartner = (index) => () => {
    setFormData((prev) => {
      const technical_partners = prev.project.technical_partners.filter((_, idx) => idx !== index);
      return {
        ...prev,
        project: { ...prev.project, technical_partners },
      };
    });
  };

  // Phase investment values (nested under project.phases)
  const handlePhaseChange = (field) => (e) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      project: {
        ...prev.project,
        phases: { ...prev.project.phases, [field]: value },
      },
    }));
  };
  // Facilitation services (checkboxes)
  const handleServiceToggle = (service) => () => {
    setFormData((prev) => {
      const services = prev.facilitation_services.services.includes(service)
        ? prev.facilitation_services.services.filter((s) => s !== service)
        : [...prev.facilitation_services.services, service];
      return {
        ...prev,
        facilitation_services: {
          ...prev.facilitation_services,
          services,
        },
      };
    });
  };

  // Attachments handler: updates arrays of files in the attachments object
  const handleAttachmentChange = (field) => (e) => {
    const files = Array.from(e.target.files);
    setFormData((prev) => ({
      ...prev,
      attachments: {
        ...prev.attachments,
        [field]: files,
      },
    }));
  };
  // Facilitation fields (other_services_detail and motivation)
  const handleFacilitationFieldChange = (field) => (e) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      facilitation_services: {
        ...prev.facilitation_services,
        [field]: value,
      },
    }));
  };
  // Declaration fields
  const handleDeclarationChange = (field) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData((prev) => ({
      ...prev,
      declaration: { ...prev.declaration, [field]: value },
    }));
  };

  // Submit handler: posts the JSON payload to the webhook.
  const handleSubmit = (e) => {
    e.preventDefault();
    // Compose payload according to backend requirements.
    const payload = {
      investor_status: formData.investor_status,
      company: formData.company,
      contacts: formData.contacts,
      project: formData.project,
      facilitation_services: formData.facilitation_services,
      declaration: formData.declaration,
      attachments: formData.attachments,
    };
    // Send POST request. In a real application you may want to
    // prompt the user for confirmation before sending data to the backend.
    fetch("https://n8n.srv920835.hstgr.cloud/webhook/OGUNINVEST-KYC", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json().catch(() => null);
      })
      .then((data) => {
        console.log("Form submitted successfully", data);
        // Mark submission as successful to show confirmation message.
        setSubmissionStatus("success");
        // Optionally, reset the form fields here if desired.
      })
      .catch((err) => {
        console.error("Submission error:", err);
        setSubmissionStatus("error");
      });
  };

  // Investor status change handler
  const handleInvestorStatusChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, investor_status: value }));
  };

  return (
    <div className="investogun-container">
      <header className="investogun-header">
        <div className="investogun-header-left">
          <img
            src="/ogundeq.png"
            alt="Ogun state crest"
            className="w-12 h-12 md:w-16 md:h-16"
          />
          <span>OGUN INVEST</span>
        </div>
        <div className="investogun-header-right">
          <img
            src="/ogunddu.png"
            alt="OgunInvest logo"
            className="oguninvest-logo"
          />
        </div>
      </header>
      <main className="investogun-main">
        <h1>New Investor Inquiry Form</h1>
        <p>
          Complete this comprehensive form to begin your investment journey in Ogun
          State. Our facilitation team will respond within 3 working days with
          tailored investment opportunities.
        </p>
        {/* Submission feedback */}
        {submissionStatus === "success" && (
          <div className="alert success-alert">
            Your application has been submitted successfully! We’ll contact you shortly.
          </div>
        )}
        {submissionStatus === "error" && (
          <div className="alert error-alert">
            There was an error submitting your form. Please try again later.
          </div>
        )}
        
        <form className="investogun-form" onSubmit={handleSubmit}>
          {/* Investor Status */}
          <section>
            <h2>Investor Status</h2>
            <p>Please select your current investment status in Ogun State</p>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  name="investmentStatus"
                  value="existing_investor"
                  checked={formData.investor_status === "existing_investor"}
                  onChange={handleInvestorStatusChange}
                />
                Existing Investor - already operating in Ogun State
              </label>
              <label>
                <input
                  type="radio"
                  name="investmentStatus"
                  value="new_investor"
                  checked={formData.investor_status === "new_investor"}
                  onChange={handleInvestorStatusChange}
                />
                New Investor - no presence in Ogun State (other state/country or
                startup)
              </label>
            </div>
          </section>

          {/* Section A — Basic Information */}
          <section>
            <h2>Section A — Basic Information</h2>
            {/* Company/Promoter name */}
            <div className="field">
              <label>Name of Company/Promoter *</label>
              <input
                type="text"
                placeholder="If registered, write Company Name; if not, Promoter Name"
                value={formData.company.name_or_promoter}
                onChange={handleCompanyFieldChange("name_or_promoter")}
              />
            </div>
            {/* CAC Registered */}
            <div className="radio-group horizontal">
              <span className="group-label">Is the company registered with CAC?</span>
              <label>
                <input
                  type="radio"
                  name="cac_registered"
                  value="Yes"
                  checked={formData.company.cac_registered === true}
                  onChange={handleCACRegisteredChange}
                />
                Yes
              </label>
              <label>
                <input
                  type="radio"
                  name="cac_registered"
                  value="No"
                  checked={formData.company.cac_registered === false}
                  onChange={handleCACRegisteredChange}
                />
                No
              </label>
            </div>
            {formData.company.cac_registered && (
              <div className="field">
                <label>
                  RC Number (please provide your registration number if you
                  answered yes)
                </label>
                <input
                  type="text"
                  value={formData.company.rc_number}
                  onChange={handleCompanyFieldChange("rc_number")}
                />
              </div>
            )}
            {/* Registered address */}
            <div className="field">
              <label>Registered Business/Head Office Address</label>
              <textarea
                value={formData.company.registered_address}
                onChange={handleCompanyFieldChange("registered_address")}
              ></textarea>
            </div>
            {/* Country of Incorporation */}
            <div className="field">
              <label>Country of Incorporation *</label>
              <select
                value={formData.company.country_of_incorporation}
                onChange={handleCompanyFieldChange("country_of_incorporation")}
              >
                <option value="" disabled>
                  Select country
                </option>
                {COUNTRIES.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>
            {/* Business location */}
            <div className="form-row">
              <div className="field">
                <label>Business Location – Country *</label>
                <select
                  value={formData.company.business_location.country}
                  onChange={handleBusinessLocationChange("country")}
                >
                  <option value="" disabled>
                    Select country
                  </option>
                  {COUNTRIES.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Business Location – State (if in Nigeria)</label>
                <select
                  value={formData.company.business_location.state_nigeria}
                  onChange={handleBusinessLocationChange("state_nigeria")}
                >
                  <option value="" disabled>
                    Select state
                  </option>
                  {NIGERIAN_STATES.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {/* Sector/Industry */}
            <div className="field">
              <label>Sector/Industry *</label>
              <input
                type="text"
                value={formData.company.sector_industry}
                onChange={handleCompanyFieldChange("sector_industry")}
              />
            </div>
            {/* Company email and website */}
            <div className="form-row">
              <div className="field">
                <label>Company Email *</label>
                <input
                  type="email"
                  value={formData.company.company_email}
                  onChange={handleCompanyFieldChange("company_email")}
                />
              </div>
              <div className="field">
                <label>Company Website</label>
                <input
                  type="url"
                  value={formData.company.company_website}
                  onChange={handleCompanyFieldChange("company_website")}
                />
              </div>
            </div>
          </section>

          {/* Section B — Leadership & Ownership */}
          <section>
            <h2>Section B — Leadership &amp; Ownership</h2>
            {/* MD/CEO details */}
            <h3>MD/CEO Details</h3>
            <div className="form-row">
              <div className="field">
                <label>Surname *</label>
                <input
                  type="text"
                  value={formData.contacts.md_ceo.surname}
                  onChange={handleMdCeoChange("surname")}
                />
              </div>
              <div className="field">
                <label>First Name *</label>
                <input
                  type="text"
                  value={formData.contacts.md_ceo.first_name}
                  onChange={handleMdCeoChange("first_name")}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="field">
                <label>Other Names</label>
                <input
                  type="text"
                  value={formData.contacts.md_ceo.other_names}
                  onChange={handleMdCeoChange("other_names")}
                />
              </div>
              <div className="field">
                <label>Nationality *</label>
                <input
                  type="text"
                  value={formData.contacts.md_ceo.nationality}
                  onChange={handleMdCeoChange("nationality")}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="field">
                <label>Mobile *</label>
                <input
                  type="tel"
                  value={formData.contacts.md_ceo.mobile}
                  onChange={handleMdCeoChange("mobile")}
                />
              </div>
              <div className="field">
                <label>Email *</label>
                <input
                  type="email"
                  value={formData.contacts.md_ceo.email}
                  onChange={handleMdCeoChange("email")}
                />
              </div>
            </div>
            {/* Directors */}
            <h3>Directors' Names</h3>
            {formData.contacts.directors.map((director, idx) => (
              <div className="field director-row" key={`director-${idx}`}>
                <label>Director {idx + 1}</label>
                <input
                  type="text"
                  value={director}
                  onChange={handleDirectorChange(idx)}
                />
                {/* Show a remove button for all but the first director */}
                {formData.contacts.directors.length > 1 && (
                  <button
                    type="button"
                    className="remove-row"
                    onClick={removeDirector(idx)}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              className="add-row"
              onClick={addDirector}
            >
              + Add Director
            </button>
            {/* Shareholders and capitalisation */}
            <h3>Share Capitalization of Company</h3>
            <div className="share-table">
              <div className="share-header">
                <span>Name of Shareholder</span>
                <span>Nationality</span>
                <span>Percentage of Shareholding</span>
                <span></span>
              </div>
              {formData.contacts.shareholders.map((shareholder, idx) => (
                <div className="share-row" key={`shareholder-${idx}`}> 
                  <input
                    type="text"
                    placeholder={`Shareholder ${idx + 1} Name`}
                    value={shareholder.name}
                    onChange={handleShareholderChange(idx, "name")}
                  />
                  <input
                    type="text"
                    placeholder="Nationality"
                    value={shareholder.nationality}
                    onChange={handleShareholderChange(idx, "nationality")}
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="any"
                    placeholder="%"
                    value={shareholder.percent}
                    onChange={handleShareholderChange(idx, "percent")}
                  />
                  {formData.contacts.shareholders.length > 1 && (
                    <button
                      type="button"
                      className="remove-row"
                      onClick={removeShareholder(idx)}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                className="add-row"
                onClick={addShareholder}
              >
                + Add Shareholder
              </button>
            </div>
            <div className="field">
              <label>Share Capitalization Amount (₦)</label>
              <input
                type="number"
                min="0"
                step="any"
                value={formData.contacts.share_capitalization_amount}
                onChange={handleShareCapAmountChange}
              />
            </div>
          </section>

          {/* Section C — Project Detail / Investment Description */}
          <section>
            <h2>Section C - Project Detail / Investment Description</h2>
            <div className="field">
              <label>Overview of Proposed Investment *</label>
              <textarea
                value={formData.project.overview}
                onChange={handleProjectFieldChange("overview")}
              ></textarea>
            </div>
            <div className="field">
              <label>Sector *</label>
              <input
                type="text"
                value={formData.project.sector}
                onChange={handleProjectFieldChange("sector")}
              />
            </div>
            <div className="field">
              <label>Total Value of Proposed Investment (USD) *</label>
              <input
                type="number"
                min="0"
                step="any"
                value={formData.project.total_value_usd}
                onChange={handleProjectFieldChange("total_value_usd")}
              />
            </div>
            {/* Investment phases */}
            <div className="form-row">
              <div className="field">
                <label>a - Initial (Year 1)</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={formData.project.phases.year1_initial}
                  onChange={handlePhaseChange("year1_initial")}
                />
              </div>
              <div className="field">
                <label>b - Phased (Year 2)</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={formData.project.phases.year2}
                  onChange={handlePhaseChange("year2")}
                />
              </div>
              <div className="field">
                <label>c - Phased (Year 3)</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={formData.project.phases.year3}
                  onChange={handlePhaseChange("year3")}
                />
              </div>
            </div>
            {/* Project location and jobs */}
            <div className="field">
              <label>Proposed Project Location in Ogun State (LGA) *</label>
              <select
                value={formData.project.location_lga}
                onChange={handleProjectFieldChange("location_lga")}
              >
                <option value="" disabled>
                  Select LGA
                </option>
                {OGUN_LGAS.map((lga) => (
                  <option key={lga} value={lga}>
                    {lga}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <div className="field">
                <label>Estimated Number of Direct Jobs *</label>
                <input
                  type="number"
                  min="0"
                  value={formData.project.jobs_direct}
                  onChange={handleProjectFieldChange("jobs_direct")}
                />
              </div>
              <div className="field">
                <label>Estimated Number of Indirect Jobs *</label>
                <input
                  type="number"
                  min="0"
                  value={formData.project.jobs_indirect}
                  onChange={handleProjectFieldChange("jobs_indirect")}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="field">
                <label>Proposed Project Commencement Date *</label>
                <input
                  type="date"
                  value={formData.project.project_commencement_date}
                  onChange={handleProjectFieldChange("project_commencement_date")}
                />
              </div>
              <div className="field">
                <label>Proposed Operations Commencement Date *</label>
                <input
                  type="date"
                  value={formData.project.operations_commencement_date}
                  onChange={handleProjectFieldChange("operations_commencement_date")}
                />
              </div>
            </div>
            {/* Raw materials */}
            <h3>Raw Materials</h3>
            <div className="materials-table">
            <div className="materials-header">
              <span>Raw Material</span>
              <span>Source</span>
              <span></span>
            </div>
              {formData.project.raw_materials.map((rm, idx) => (
                <div className="materials-row" key={`material-${idx}`}>
                  <input
                    type="text"
                    placeholder={`Material ${idx + 1}`}
                    value={rm.material}
                    onChange={handleRawMaterialChange(idx, "material")}
                  />
                  <input
                    type="text"
                    placeholder="Source"
                    value={rm.source}
                    onChange={handleRawMaterialChange(idx, "source")}
                  />
                  {formData.project.raw_materials.length > 1 && (
                    <button
                      type="button"
                      className="remove-row"
                      onClick={removeRawMaterial(idx)}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                className="add-row"
                onClick={addRawMaterial}
              >
                + Add Raw Material
              </button>
            </div>
            {/* Technical partners */}
            <h3>Technical Partners</h3>
            <div className="partners-table">
            <div className="partners-header">
              <span>Partner Institution / Company Name</span>
              <span>Country of Origin</span>
              <span>Website</span>
              <span></span>
            </div>
              {formData.project.technical_partners.map((partner, idx) => (
                <div className="partners-row" key={`partner-${idx}`}>
                  <input
                    type="text"
                    placeholder={`Partner ${idx + 1} Name`}
                    value={partner.name}
                    onChange={handlePartnerChange(idx, "name")}
                  />
                  <input
                    type="text"
                    placeholder="Country of Origin"
                    value={partner.country_of_origin}
                    onChange={handlePartnerChange(idx, "country_of_origin")}
                  />
                    <input
                      type="url"
                      placeholder="Website"
                      value={partner.website}
                      onChange={handlePartnerChange(idx, "website")}
                    />
                    {formData.project.technical_partners.length > 1 && (
                      <button
                        type="button"
                        className="remove-row"
                        onClick={removePartner(idx)}
                      >
                        ×
                      </button>
                    )}
                </div>
              ))}
              <button
                type="button"
                className="add-row"
                onClick={addPartner}
              >
                + Add Technical Partner
              </button>
            </div>
          </section>

          {/* Section D — Facilitation Services */}
          <section>
            <h2>Section D - Facilitation Services</h2>
            <p>Facilitation services required (please select all that apply)</p>
            <div className="checkbox-group">
              {FACILITATION_OPTIONS.map((service) => (
                <label key={service}>
                  <input
                    type="checkbox"
                    checked={formData.facilitation_services.services.includes(service)}
                    onChange={handleServiceToggle(service)}
                  />
                  {service}
                </label>
              ))}
            </div>
            {/* Other services detail */}
            <div className="field">
              <label>Others (please state)</label>
              <input
                type="text"
                value={formData.facilitation_services.other_services_detail}
                onChange={handleFacilitationFieldChange("other_services_detail")}
              />
            </div>
            {/* How did you hear about us */}
            <div className="field">
              <label>How did you hear about us? *</label>
              <select
                value={formData.facilitation_services.how_heard}
                onChange={handleFacilitationFieldChange("how_heard")}
              >
                <option value="" disabled>
                  Select option
                </option>
                {HOW_HEARD_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            {formData.facilitation_services.how_heard === "Others" && (
              <div className="field">
                <label>Please specify</label>
                <input
                  type="text"
                  value={formData.facilitation_services.how_heard_other_detail}
                  onChange={handleFacilitationFieldChange("how_heard_other_detail")}
                />
              </div>
            )}
            {/* Motivation */}
            <div className="field">
              <label>What motivates your interest in investing in Ogun State?</label>
              <textarea
                value={formData.facilitation_services.motivation}
                onChange={handleFacilitationFieldChange("motivation")}
              ></textarea>
            </div>
          </section>

          {/* Attachments */}
          <section>
            <h2>Attachments</h2>
            <p>Please upload any supporting documents (optional)</p>
            <div className="field">
              <label>Business Plan Files (optional)</label>
              <input
                type="file"
                multiple
                onChange={handleAttachmentChange("business_plan_files")}
              />
            </div>
            <div className="field">
              <label>Company Corporate Profile Files (optional)</label>
              <input
                type="file"
                multiple
                onChange={handleAttachmentChange("company_profile_files")}
              />
            </div>
          </section>

          {/* Declaration */}
          <section>
            <h2>Declaration</h2>
            <p className="declaration-text">
              "I hereby declare that the information provided in this form is
              accurate and submitted in good faith for investment facilitation
              purposes."
            </p>
            <div className="checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.declaration.agreed}
                  onChange={handleDeclarationChange("agreed")}
                />
                I agree to the declaration above *
              </label>
            </div>
            <div className="form-row">
              <div className="field">
                <label>Name *</label>
                <input
                  type="text"
                  value={formData.declaration.signer_name}
                  onChange={handleDeclarationChange("signer_name")}
                />
              </div>
              <div className="field">
                <label>Designation/Role *</label>
                <input
                  type="text"
                  value={formData.declaration.designation_role}
                  onChange={handleDeclarationChange("designation_role")}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="field">
                <label>Date *</label>
                <input
                  type="date"
                  value={formData.declaration.date}
                  onChange={handleDeclarationChange("date")}
                />
              </div>
              <div className="field">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  value={formData.declaration.phone}
                  onChange={handleDeclarationChange("phone")}
                />
              </div>
            </div>
            <div className="field">
              <label>Email *</label>
              <input
                type="email"
                value={formData.declaration.email}
                onChange={handleDeclarationChange("email")}
              />
            </div>
            <div className="submit-wrapper">
              <button type="submit" className="submit-button">
                Submit Application
              </button>
            </div>
          </section>

          {/* Attachments */}
        </form>
      </main>
      <footer>
        <p>OGUN INVEST</p>
        <p>Investment Facilitation Agency, Ogun State Government</p>
        <p>© 2025 Ogun State Government. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default InvestogunForm;