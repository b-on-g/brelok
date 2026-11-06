namespace $.$$ {

	$mol_style_define( $bog_brelok_app, {

		Settings: {
			flex: {
				wrap: 'wrap',
			},
			gap: $mol_gap.block,
		},

		Size_presets: {
			flex: {
				wrap: 'wrap',
			},
		},

		Result: {
			align: {
				items: 'center',
			},
			gap: $mol_gap.block,
			padding: $mol_gap.block,
			flex: {
				wrap: 'wrap',
			},
		},

		Result_text: {
			flex: {
				grow: 1,
				shrink: 1,
				basis: '20rem',
			},
			font: {
				size: '1.125rem',
				weight: 'bold',
			},
		},

		Views: {
			flex: {
				wrap: 'wrap',
			},
			gap: $mol_gap.block,
		},

		Scheme_card: {
			flex: {
				grow: 1,
				shrink: 1,
				basis: '20rem',
			},
			minWidth: 0,
		},

		Hang_card: {
			flex: {
				grow: 1,
				shrink: 1,
				basis: '20rem',
			},
			minWidth: 0,
		},

		Scheme: {
			width: '100%',
			height: '26rem',
			cursor: 'crosshair',
			background: {
				color: $mol_theme.card,
			},
			border: {
				radius: $mol_gap.round,
			},
		},

		Hang: {
			width: '100%',
			height: '26rem',
			background: {
				color: $mol_theme.card,
			},
			border: {
				radius: $mol_gap.round,
			},
		},

	} )

}
