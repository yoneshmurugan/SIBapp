
export function validateEmail(value) {
	if (!value) return 'Email is required';
	const ok = /\S+@\S+\.\S+/.test(value);
	return ok ? '' : 'Enter a valid email';
}

export function validatePassword(value) {
	if (!value) return 'Password is required';
	if (value.length < 6) return 'Minimum 6 characters';
	return '';
}
