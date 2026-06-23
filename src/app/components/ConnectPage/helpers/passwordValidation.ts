export interface PasswordValidationRule {
	name: string;
	message: string;
	isSatisfiedBy: (password: string) => boolean;
}

export const PASSWORD_VALIDATION_RULES: PasswordValidationRule[] = [
	{
		name: 'minLength',
		message: 'Must be at least 8 characters long',
		isSatisfiedBy: (password) => password.length >= 8,
	},
];

export function getFirstFailedPasswordRule(password: string): PasswordValidationRule | null {
	for (const rule of PASSWORD_VALIDATION_RULES) {
		if (!rule.isSatisfiedBy(password)) {
			return rule;
		}
	}
	return null;
}
