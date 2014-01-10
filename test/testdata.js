
module.exports = {
    users: [
	{ username: 'john', fullname: 'John Doe',     rank: "member", email: "john.doe@example.com" },
	{ username: 'jack', fullname: 'Jack Sparrow', rank: "admin",  email: "jack.sparrow@blackpearl.example.com"}
    ],
    groups: [
	{ name: 'Administrators' },
	{ name: 'Moderators' },
	{ name: 'Members' },
    ],
    permissions: [
	{ name: 'creategroup' },
	{ name: 'readgroup' },
	{ name: 'updategroup' },
	{ name: 'deletegroup' },
    ]
}