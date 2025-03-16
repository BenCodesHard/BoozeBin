
// tests/__mocks__/supabaseClient.js
export default {
	from: jest.fn(() => ({
		select: jest.fn().mockReturnThis(),
		eq: jest.fn().mockReturnThis(),
		single: jest.fn().mockResolvedValue({ data: { stuff: ['Salt'] }, error: null }),
		insert: jest.fn().mockResolvedValue({ data: null, error: null }),
		update: jest.fn().mockResolvedValue({ data: null, error: null }),
	})),
};

