/**
 * The facts the page repeats in more than one place — nav, hero, contact,
 * footer — kept here so they are edited once.
 */

export const person = {
	name: 'Obsan Diribsa',
	first: 'Obsan',
	last: 'Diribsa',
	role: 'Software engineer',
	city: 'Addis Ababa',
	country: 'Ethiopia',
	/** IANA zone for the live local clock. */
	timeZone: 'Africa/Addis_Ababa',
	timeZoneLabel: 'EAT',
	email: 'obsannew@gmail.com',
	phone: '+251 940 844 097',
	phoneHref: 'tel:+251940844097',
	cv: '/Obsan Diribsa CV.pdf'
};

export const sections = [
	{ id: 'about', label: 'About' },
	{ id: 'skills', label: 'Stack' },
	{ id: 'services', label: 'Services' },
	{ id: 'projects', label: 'Work' },
	{ id: 'contact', label: 'Contact' }
] as const;

export const socials = [
	{ label: 'GitHub', handle: 'OBRND', href: 'https://github.com/OBRND' },
	{ label: 'Telegram', handle: '@OBDREAMER', href: 'https://t.me/OBDREAMER' },
	{ label: 'Email', handle: person.email, href: `mailto:${person.email}` }
	// LinkedIn is left out on purpose: the previous link was the template
	// placeholder (linkedin.com/in/yourusername). Add the real profile here and
	// it appears in the menu, the contact section and the footer at once:
	// { label: 'LinkedIn', handle: 'your-handle', href: 'https://linkedin.com/in/your-handle' }
];
