// @ts-nocheck -- Bun executes this JavaScript test; TypeScript checks the imported source.
import { describe, expect, test } from 'bun:test';
import { navigationProtection } from '../src/lib/editor-protection.ts';

const state = {
	busy: false,
	dirty: false,
	readingPhotos: false,
	discarding: false,
	willUnload: false,
	popstate: false,
	dialogOpen: false
};

describe('editor navigation protection', () => {
	test('allows a clean editor to leave', () => {
		expect(navigationProtection(state)).toBe('allow');
	});
	test('confirms unsaved edits for links, history, and document unloading', () => {
		for (const navigation of [{}, { popstate: true }, { willUnload: true }]) {
			expect(navigationProtection({ ...state, ...navigation, dirty: true })).toBe('confirm');
		}
	});
	test('protects a selected photo before FileReader has produced a dirty queue', () => {
		expect(navigationProtection({ ...state, readingPhotos: true })).toBe('confirm');
	});
	test('prevents navigation during a mutation even if there are no dirty edits', () => {
		for (const navigation of [{}, { popstate: true, dialogOpen: true }, { willUnload: true }]) {
			expect(navigationProtection({ ...state, ...navigation, busy: true })).toBe('busy');
		}
	});
	test('Back closes the active dialog before attempting to leave', () => {
		expect(navigationProtection({ ...state, dirty: true, popstate: true, dialogOpen: true })).toBe(
			'close-dialog'
		);
		expect(
			navigationProtection({ ...state, dirty: true, willUnload: true, dialogOpen: true })
		).toBe('confirm');
	});
	test('allows explicitly confirmed discard or completed server navigation', () => {
		expect(navigationProtection({ ...state, dirty: true, discarding: true })).toBe('allow');
	});
});
