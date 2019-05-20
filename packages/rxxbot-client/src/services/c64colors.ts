interface TextWithClassName {
	text: string;
	className: string;
}

const c64Colors = [
	'Black',      // 0
	'White',      // 1
	'Red',        // 2
	'Cyan',       // 3
	'Violet',     // 4
	'Green',      // 5
	'Blue',       // 6
	'Yellow',     // 7
	'Orange',     // 8
	'Brown',      // 9
	'LightRed',   // a
	'DarkGrey',   // b
	'Grey',       // c
	'LightGreen', // d
	'LightBlue',  // e
	'LightGrey',  // f
];

const renderC64Text = (
	text: string,
	defaultClassName: string,
	byChar: boolean,
): TextWithClassName[] => {
	const output: TextWithClassName[] = [];
	let currentWord: string = '';
	let className: string = defaultClassName;
	let escape: number = 0;
	for (let i = 0; i < text.length; i += 1) {
		const ch = text[i];
		if (escape === 1) {
			if (ch === 'r') {
				if (!byChar && currentWord) {
					output.push({
						className,
						text: currentWord,
					});
					currentWord = '';
				}
				className = defaultClassName;
				escape = 0;
				continue;
			}
			const c = parseInt(ch, 16);
			if (isNaN(c)) {
				escape = 0;
				continue;
			}
			className = `c64${c64Colors[c]}`;
			escape = 2;
			continue;
		}
		if (escape === 2) {
			if (ch === ',') {
				escape = 3;
				continue;
			}
			escape = 0;
			i -= 1;
			continue;
		}
		if (escape === 3) {
			const c = parseInt(ch, 16);
			if (isNaN(c)) {
				i -= 2;
			} else {
				className += ` c64${c64Colors[c]}Bg`;
			}
			escape = 0;
			continue;
		}
		if (ch === '%') {
			if (i + 1 < text.length && text[i + 1] === '%') {
				i += 1;
			} else {
				escape = 1;
				continue;
			}
		}
		if (byChar) {
			output.push({
				className,
				text: ch,
			});
		} else {
			currentWord += ch;
			if (ch === ' ') {
				output.push({
					className,
					text: currentWord,
				});
				currentWord = '';
			}
		}
	}
	if (!byChar && currentWord) {
		output.push({
			className,
			text: currentWord,
		});
	}
	return output;
};

export const renderC64Words = (
	text: string,
	defaultClassName: string = 'c64Green',
) => renderC64Text(text, defaultClassName, false);

export const renderC64Chars = (
	text: string,
	defaultClassName: string = 'c64Green',
) => renderC64Text(text, defaultClassName, true);
