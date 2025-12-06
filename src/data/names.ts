// Name generation for marks (victims)

const FIRST_NAMES_MALE = [
  'Robert', 'James', 'William', 'Richard', 'Thomas', 'Charles', 'Michael',
  'David', 'John', 'Paul', 'George', 'Steven', 'Edward', 'Donald', 'Ronald',
  'Kenneth', 'Arthur', 'Harold', 'Frank', 'Raymond', 'Howard', 'Eugene',
  'Lawrence', 'Gerald', 'Henry', 'Carl', 'Walter', 'Albert', 'Ralph', 'Roy',
];

const FIRST_NAMES_FEMALE = [
  'Mary', 'Patricia', 'Barbara', 'Elizabeth', 'Margaret', 'Dorothy', 'Linda',
  'Nancy', 'Karen', 'Susan', 'Betty', 'Helen', 'Sandra', 'Donna', 'Carol',
  'Ruth', 'Sharon', 'Michelle', 'Laura', 'Sarah', 'Kimberly', 'Deborah',
  'Jessica', 'Shirley', 'Cynthia', 'Angela', 'Melissa', 'Brenda', 'Amy', 'Anna',
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller',
  'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez',
  'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark',
  'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King',
  'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green',
];

const TITLES = [
  'Mr.', 'Mrs.', 'Ms.', 'Dr.', '',
];

export const generateMarkName = (): string => {
  const isMale = Math.random() > 0.5;
  const firstName = isMale
    ? FIRST_NAMES_MALE[Math.floor(Math.random() * FIRST_NAMES_MALE.length)]
    : FIRST_NAMES_FEMALE[Math.floor(Math.random() * FIRST_NAMES_FEMALE.length)];
  const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  const title = Math.random() > 0.7 ? TITLES[Math.floor(Math.random() * TITLES.length)] + ' ' : '';

  return `${title}${firstName} ${lastName}`.trim();
};

// Generate a net worth for a mark (how much they can invest)
export const generateMarkNetWorth = (): number => {
  // Distribution: mostly small fish, some medium, rare whales
  const roll = Math.random();

  if (roll < 0.5) {
    // Small fish: $5K - $25K
    return Math.floor(5000 + Math.random() * 20000);
  } else if (roll < 0.8) {
    // Medium fish: $25K - $100K
    return Math.floor(25000 + Math.random() * 75000);
  } else if (roll < 0.95) {
    // Big fish: $100K - $500K
    return Math.floor(100000 + Math.random() * 400000);
  } else {
    // Whale: $500K - $2M
    return Math.floor(500000 + Math.random() * 1500000);
  }
};

// Firm name suggestions
export const FIRM_NAME_PREFIXES = [
  'Sterling', 'Stratton', 'Wellington', 'Hampton', 'Ashford', 'Cromwell',
  'Fairfield', 'Berkshire', 'Westbrook', 'Kensington', 'Cambridge', 'Oxford',
  'Madison', 'Hartford', 'Bradford', 'Crawford', 'Sheffield', 'Whitfield',
];

export const FIRM_NAME_SUFFIXES = [
  'Partners', 'Capital', 'Securities', 'Investments', 'Group', 'Associates',
  'Holdings', 'Advisors', 'Asset Management', 'Wealth Management', 'Financial',
  '& Co.', '& Associates', 'Trading', 'Brokerage',
];

export const generateFirmName = (): string => {
  const prefix = FIRM_NAME_PREFIXES[Math.floor(Math.random() * FIRM_NAME_PREFIXES.length)];
  const suffix = FIRM_NAME_SUFFIXES[Math.floor(Math.random() * FIRM_NAME_SUFFIXES.length)];
  return `${prefix} ${suffix}`;
};
