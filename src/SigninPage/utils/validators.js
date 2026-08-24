
export function validateIdentifier(value) {
	if (!value) return 'Email or Phone Number is required';
	const isEmail = /\S+@\S+\.\S+/.test(value);
	const isPhone = /^\+?[0-9\s-]{7,20}$/.test(value);
	const ok = isEmail || isPhone;
	return ok ? '' : 'Enter a valid email or phone number';
}

export function validatePassword(value) {
	if (!value) return 'Password is required';
	if (value.length < 6) return 'Minimum 6 characters';
	return '';
}
