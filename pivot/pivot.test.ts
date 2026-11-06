namespace $ {

	function image( rows: string[] ) {

		const height = rows.length
		const width = rows[ 0 ].length
		const data = new Uint8ClampedArray( width * height * 4 )

		const colors: Record< string, number[] > = {
			'.': [ 255, 255, 255, 255 ],
			' ': [ 0, 0, 0, 0 ],
			'#': [ 200, 30, 30, 255 ],
			'o': [ 250, 250, 250, 255 ],
		}

		for( let y = 0; y < height; ++ y ) {
			for( let x = 0; x < width; ++ x ) {
				data.set( colors[ rows[ y ][ x ] ], ( y * width + x ) * 4 )
			}
		}

		return $bog_brelok_pivot.from_rgba( data, width, height )
	}

	$mol_test( {

		'white background is cut, white inside stays'() {

			const pivot = image( [
				'.......',
				'.#####.',
				'.#ooo#.',
				'.#ooo#.',
				'.#####.',
				'.......',
			] )

			$mol_assert_equal( pivot.area(), 20 )
			$mol_assert_equal( pivot.filled( 3, 3 ), true )
			$mol_assert_equal( pivot.filled( 0, 0 ), false )

		},

		'transparent pixels are never part of keychain'() {

			const pivot = image( [
				'     ',
				' ### ',
				' # # ',
				' ### ',
				'     ',
			] )

			$mol_assert_equal( pivot.area(), 8 )
			$mol_assert_equal( pivot.filled( 2, 2 ), false )

		},

		'hole of symmetric keychain is on top middle'() {

			const pivot = image( [
				'......',
				'.####.',
				'.####.',
				'.####.',
				'.####.',
				'......',
			] )

			$mol_assert_equal( pivot.center(), { x: 3, y: 3 } )
			$mol_assert_equal( pivot.edge( 0 ), { x: 3, y: 1 } )
			$mol_assert_equal( pivot.hole( 0, 1 ), { x: 3, y: 2 } )
			$mol_assert_equal( pivot.tilt( { x: 3, y: 1 } ), 0 )
			$mol_assert_equal( pivot.covers( { x: 3, y: 3 }, .5 ), true )
			$mol_assert_equal( pivot.covers( { x: 3, y: 1.5 }, 1 ), false )

		},

		'hole of lopsided keychain shifts to heavy side'() {

			const pivot = image( [
				'..........',
				'.#........',
				'.#........',
				'.#####....',
				'.#########',
				'..........',
			] )

			const center = pivot.center()!
			const edge = pivot.edge( 0 )!

			$mol_assert_equal( edge.x, center.x )
			$mol_assert_equal( center.x > 3, true )
			$mol_assert_equal( pivot.tilt( { x: 1.5, y: 1.5 } ) > 30, true )
			$mol_assert_equal( pivot.tilt( edge ), 0 )

		},

		'bounds wrap only keychain'() {

			const pivot = image( [
				'.....',
				'..#..',
				'.###.',
				'.....',
			] )

			$mol_assert_equal( pivot.bounds(), { left: 1, top: 1, right: 4, bottom: 3, width: 3, height: 2 } )

		},

	} )

}
