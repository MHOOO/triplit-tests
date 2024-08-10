import './style.css';

import { TriplitClient } from '@triplit/client';
import { type ClientSchema, Schema as S } from '@triplit/client';
import { SQLocal } from 'sqlocal';

/**
 * Define your schema here. After:
 * - Pass your schema to your Triplit client
 * - Push your schema to your Triplit server with 'triplit schema push'
 *
 * For more information about schemas, see the docs: https://www.triplit.dev/docs/schemas
 */
const videoCropOptions = S.Record({
	// crop from top (e.g. "10%")
	top: S.Optional(S.String()),
	// crop from bottom (e.g. "10%")
	bottom: S.Optional(S.String())
});
const videoOffsetOptions = S.Record({
	// offset from start in [s]
	start_offset: S.Optional(S.Number()),
	// offset from end in [s]
	end_offset: S.Optional(S.Number())
});
const videoOptions = S.Record({
	crop: videoCropOptions,
	offset: videoOffsetOptions
});
export const schema = {
	// Basic user information. No password / auth support yet
	users: {
		schema: S.Schema({
			id: S.Id(),
			email: S.String(),
			created_at: S.Date({ default: S.Default.now() })
		})
	},
	videos: {
		schema: S.Schema({
			id: S.Id(),
			// 460ms ⇒ 360ms: 100ms
			title: S.String(),
			// 460ms
			// url: S.String(),
			// 750ms ⇒ 460ms: ~300ms
			// tags: S.Set(S.String()),
			// 850ms ⇒ 750ms: ~100ms
			// created_at: S.Date({ default: S.Default.now() }),

			// duplicate videos share the same ID here
			video_duplicates_id: S.Optional(S.String())

			// options for video display (1150ms ⇒ 850ms: 300ms)
			// options: videoOptions
		})
	}
} satisfies ClientSchema;

let client = new TriplitClient({
	// logLevel: 'debug',
	schema: schema,
	serverUrl: '',
	token:
		'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ4LXRyaXBsaXQtdG9rZW4tdHlwZSI6InNlY3JldCIsIngtdHJpcGxpdC1wcm9qZWN0LWlkIjoibG9jYWwtcHJvamVjdC1pZCJ9.8Z76XXPc9esdlZb2b7NDC7IVajNXKc4eVcPsO7Ve0ug',
	// autoConnect: browser,
	storage: 'indexeddb'
});

function setupLog() {
	const log = console.log.bind(console);
	console.log = (...args) => {
		log(...args);
		document.body.innerHTML += [...args].join('') + '<br/>';
	};
}

async function genData() {
	const defaultUser = {
		email: 'anon@gmail.com'
	};
	console.time('Timing user fetch');
	let user = await client.fetchOne(
		client.query('users').where('email', '=', defaultUser.email).build()
	);
	console.timeEnd('Timing user fetch');
	if (!user) {
		console.time('Timing user insert');
		user = (await client.insert('users', defaultUser)).output;
		console.timeEnd('Timing user insert');
	}
	let entryCount = 400;
	console.time(`Timing video insertion (${entryCount} rows)`);
	for (let i = 0; i < entryCount; ++i) {
		await client.insert('videos', {
			title: 'Dummy Title ' + i
			// url: `/videos/${i}.mpd`,
			// tags: ["Kizomba", "$:/tags/video"],
		});
	}
	console.timeEnd(`Timing video insertion (${entryCount} rows)`);
}

async function fetchVideos() {
	console.time('Timing videos fetch');
	let result = await client.fetch(client.query('videos').build(), { policy: 'local-only' });
	console.log(`Fetched ${result.size} many videos`);
	console.timeEnd('Timing videos fetch');
	return result;
}

async function sqlocal() {
	// Create a client with a name for the SQLite file to save in
	// the origin private file system
	const { sql } = new SQLocal('database.sqlite3');
}

async function run() {
	setupLog();
	await sqlocal();
	let vids = await fetchVideos();
	if (vids.size == 0) {
		await genData();
		console.log('Database was successfully seeded, you may now refresh the browser tab.');
	}
}

window.onload = run;
