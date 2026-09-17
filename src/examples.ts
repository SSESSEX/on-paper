export interface ExampleAdvert {
  id: string;
  name: string;
  tag: string;
  title: string;
  employer: string;
  text: string;
}

export const CONCRETE_EXAMPLE: ExampleAdvert = {
  id: 'concrete',
  name: 'Concrete vacancy (7 of 7)',
  tag: 'CONCRETE',
  title: 'Lead Industrial Data Engineer',
  employer: 'Apex Metallurgy Ltd',
  text: `Apex Metallurgy Ltd is seeking a Lead Industrial Data Engineer. In this role, you join the Plant Analytics team at our Rotherham facility, reporting directly to the Head of Data Platform. 

Starting October 2026, we are hiring for two positions due to the expansion of our smart manufacturing programme. 

Our assessment stages comprise an initial screening call, a 45-minute technical exercise, followed by a panel interview on 12 November. 

In this post, you own the daily yield report the Sheffield line runs on and the automated furnace telemetry ingestion engine. 

The base compensation is £68,000–£74,000 with private healthcare, 28 days holiday, and a pension match up to 8%.`,
};

export const VAGUE_EXAMPLE: ExampleAdvert = {
  id: 'vague',
  name: 'Vague pipeline vacancy (0 of 7)',
  tag: 'VAGUE',
  title: 'Full Stack Ninja / Growth Catalyst',
  employer: 'Nexis Enterprise Solutions',
  text: `Nexis Enterprise Solutions is constantly expanding and building a pipeline of candidates for future opportunities. We are seeking passionate and energetic problem solvers who are comfortable with ambiguity and want to make a real impact.

In this exciting position, you will work closely with dynamic key stakeholders to deliver cutting-edge modern value across numerous initiatives. 

Immediate start available for the right candidate. We are currently recruiting for multiple roles across several business units.

Our recruitment is flexible and continuous — a member of our recruitment team will be in touch when a suitable project arises. 

You will be expected to multitask across diverse agile sprints, attend regular standups, write clean documentation, and contribute enthusiastically to company culture.

We provide a competitive salary dependent on experience, generous snacks, and exciting social outings.`,
};

export const SHORTLIST_EXAMPLE_TEXT = `Title: Senior Reliability Engineer
Employer: Vanguard Power Systems

Vanguard Power Systems is hiring for the High Voltage Grid Operations team, reporting to the Principal Infrastructure Architect. Starting September 2026, we have exactly one position open. Hiring process: an online technical test, followed by a onsite design panel on 18 October. In this role, you own the primary emergency breaker failover firmware. Base pay is £72,000–£80,000.

---
Title: Digital Innovation Associate
Employer: Horizon Ventures

Horizon Ventures is building a talent pipeline of candidates for future opportunities. You will collaborate with diverse stakeholders on various exciting initiatives. Immediate start. Multiple roles available. A member of our recruitment team will be in touch if your CV aligns. Duties include supporting ongoing workstreams. Competitive remuneration DOE.

---
Title: Frontend Staff Engineer
Employer: Calibrate Medical

Calibrate Medical is looking for a specialist to join the Diagnostic UI squad. You will report directly to the VP of Engineering. We are hiring three engineers with intake starting January 2027. Selection stages: take-home code submission, then a panel interview on 5 December. You own the surgical telemetry visualization suite. Offering £85,000–£92,000 plus equity.

---
Title: Technical Support Specialist
Employer: CloudScale Systems

CloudScale Systems has an opening reporting to the Customer Support Lead. Intake starting 15 November 2026 for one position. Stages: technical screening followed by final culture interview on 28 October. General support duties across our ticketing queues. Salary £32,000–£35,000.

---
Title: Operations Assistant
Employer: Global Meridian

Global Meridian is welcoming applications. Work with various internal departments across our enterprise. Immediate start. We are reviewing candidates on an ongoing basis. A member of our team will contact shortlisted applicants. Varied clerical tasks. Negotiable salary.`;
