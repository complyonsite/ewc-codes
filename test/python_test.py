import json
from pathlib import Path
import unittest
import ewc_codes as ewc


class PackageTest(unittest.TestCase):
    def test_every_record(self):
        data = json.loads((Path(__file__).parent.parent / 'ewc-codes.json').read_text())
        self.assertEqual(len(data), 842)
        for entry in data:
            self.assertEqual(ewc.lookup(entry['display']), entry)
            self.assertEqual(ewc.is_hazardous(entry['code']), entry['hazardous'])
            self.assertEqual([p['code'] for p in ewc.mirror_partners(entry['code'])], entry['mirrorPartners'])

    def test_helpers_and_unknowns(self):
        for value in ['170904', '17 09 04', '17-09-04', '17.09.04', '17  09  04 *']:
            self.assertTrue(ewc.validate_code_format(value))
            self.assertEqual(ewc.normalise_code(value), '170904')
        for value in ['', '17/09/04', '17-09.04', '1709040', '１７０９０４']:
            self.assertFalse(ewc.validate_code_format(value))
        self.assertTrue(ewc.validate_code_format('999999'))
        self.assertIsNone(ewc.lookup('999999'))
        self.assertIsNone(ewc.is_hazardous('999999'))
        self.assertFalse(ewc.is_hazardous('170904*'))
        self.assertEqual(ewc.search('17-09'), [ewc.lookup(c) for c in ['170901', '170902', '170903', '170904']])
        self.assertIn('170605', [e['code'] for e in ewc.search('asbestos')])
        self.assertEqual(ewc.search(''), [])
        self.assertEqual(ewc.search('99 99 99'), [])
        self.assertTrue(ewc.reference_url('170904').endswith('?code=17-09-04'))
        self.assertIsNone(ewc.reference_url('999999'))

    def test_caller_changes_do_not_corrupt_data(self):
        entry = ewc.lookup('170904')
        entry['chapter']['title'] = 'changed'
        entry['mirrorPartners'].clear()
        self.assertEqual(len(ewc.mirror_partners('170904')), 3)
        self.assertNotEqual(ewc.lookup('170904')['chapter']['title'], 'changed')
