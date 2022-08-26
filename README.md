## Questions

### To Design

- How should we indicate that the field is required?
- Should we use placeholders to indicate the format for number fields such as phone and FEIN?
- Should we also validate when the input changes or just when you go to the next step or submit the form?
- How should we validate phone numbers?
	- Consider using 3rd party validator like [libphonenumber](https://github.com/google/libphonenumber)
		- **Pros:** accurate
		- **Cons:** adds size, needs to be updated to keep up
	- Consider validating only the format
		- **Pros:** simple, small
		- **Cons:** only validates format not real numbers
- How should we validate FEIN?
	- Consider using 3rd party [ein-validator](https://www.npmjs.com/package/ein-validator)
	- Consider validating only the format
- Do we need to validate that the email belongs to a real person?
	- Consider sending a confimation email with a link to confirm the form submission
- How would a user enter multiple states?
	- Should it use a multiple select dropdown component instead of a text field?

### To Product

- Can a field be dependent on multiple fields? This will affect the design of the API.

## Breakdown

### Prerequisites

- Define API (me)
- Create multi-step form prototype (me)

### Week 1

- Implement API endpoint with dummy data (dev 1)
- Build mappings from field types to UI components using dummy data (dev 2)
- Implement multi-step form and validation logic (me)
- Alignment meeting with Product and Design to review prototype with dummy data (may suggest features and fixes)

### Week 2

- Work on fixes and approved features (team)
- Integrate and test API with real data (dev 1)
- Build step forms using UI components and test validation rules (dev 2)
- Integrate steps and API with real data into multi-step form and test form submission (me)
- Alignment meeting with Product and Design to review application with real data (may suggest features and fixes for next release)
- Fix high profile functional bugs before deploying to production (team)
- Deployment (me)

### Compromises to deliver faster

- Only creating mappings to field types used in the form
- Only testing field types used in the form
- Report generic error message for any error code

