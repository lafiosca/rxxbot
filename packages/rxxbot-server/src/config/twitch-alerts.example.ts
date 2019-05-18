import {
	TwitchMessageType,
	TwitchMessageEventJoin,
	TwitchAlertsConfig,
	TwitchMessageEventCheer,
} from 'rxxbot-types';

const twitchAlertsConfig: Partial<TwitchAlertsConfig> = {
	channel: 'lafiosca',
	alerts: [
		{
			type: TwitchMessageType.Cheer,
			callback: (message) => {
				const cheer = message as TwitchMessageEventCheer['message'];
				const { totalBits } = cheer;
				// TODO: conditional logic based on size of cheer
				const bitStr = totalBits === 1 ? '1 bit' : `${totalBits} bits`;
				return {
					captionTemplates: [
						`@{user} cheered for ${bitStr}!`,
						`Incoming cheer for ${bitStr} from @{user}!`,
					],
					crawlTemplates: [
						`Thank you for the cheer of ${bitStr}, @{user}!!`,
						`Your cheer of ${bitStr} is appreciated, @{user}!!`,
						`@{user} is a sweetheart! Thanks for cheering with ${bitStr}!!`,
					],
					videos: [
						{
							video: 'cheer/chocolate-with-nuts.mp4',
							credit: 'SpongeBob SquarePants - Chocolate with Nuts',
							captionTemplates: [
								`@{user} cheered for ${bitStr}, with nuts!`,
								`@{user}, DID YOU SAY ${bitStr}??`,
							],
						},
						{
							video: 'cheer/adventures-in-success-money.mp4',
							credit: 'Will Powers - Adventures in Success',
						},
						{
							video: 'cheer/i-dont-need-a-reason.mp4',
							credit: 'Dizzee Rascal - I Don\'t Need a Reason',
						},
						{
							video: 'cheer/gimme-the-mermaid.mp4',
							credit: 'Negativland - Gimme the Mermaid',
						},
						{
							video: 'cheer/gimme-pizza.mp4',
							credit: 'Wolfgore - When does a dream become a nightmare?',
						},
					],
				};
			},
		},
		{
			type: TwitchMessageType.Chat,
			captionTemplates: [
				'Incoming chat message from @{user}',
				'More words from @{user}',
			],
			videos: [
				{
					video: 'follow/macho-madness-ooh-yeah.mp4',
					credit: 'Mike Diva - Macho Madness Forever',
					captionTemplates: ['Ooh yeah, @{user}\'s talkin!'],
				},
				{
					video: 'triggers/bill-cipher-buy-gold.mp4',
					credit: 'Alex Hirsch - Gravity Falls S1E19, "Dreamscaperers"',
					crawlTemplates: [
						'Remember! Reality\'s an illusion, the universe is a hologram, buy gold! Byeeee!',
					],
				},
				{
					video: 'follow/brent-rambo.mp4',
					credit: 'Early 1990s Apple Promo Video',
					captionTemplates: null,
					crawlTemplates: [
						'Dear Mr. Sculley, @{user} rules the world!',
						'Thumbs up to @{user}!',
					],
				},
				{
					video: 'follow/come-play-with-us.mp4',
					credit: 'Nick DenBoer & Davy Force - The Chickening',
					captionTemplates: ['Come play with us, @{user}! Forever and ever and ever!'],
				},
				{
					video: 'follow/kitty-city.mp4',
					credit: 'Cyriak - Welcome to Kitty City',
					captionTemplates: ['Welcome to kitty city, @{user}!'],
				},
			],
		},
		{
			type: TwitchMessageType.Join,
			callback: (message) => {
				switch ((message as TwitchMessageEventJoin['message']).user) {
					case 'slurpeeeye':
						return {
							videos: ['bill-cipher-buy-gold.mp4'],
							captionTemplates: ['Hey, it\'s @SlurpeeEye!'],
						};
					default:
						return null;
				}
			},
		},
	],
};

export default twitchAlertsConfig;
