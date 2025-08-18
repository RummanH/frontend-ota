export const SKIP_PRELOADER_HEADER_NAME = 'skip-preloader';
export const SKIP_PRELOADER_HEADER = { 'skip-preloader': 'true' };

export const previewTicketData = {
    AgencyDetails: {
        CompanyLogoPath: 'http://103.95.97.155/sabre/assets/img/Sabre-logo_RGB-RED.png',
        AgencyName: 'AirFly Travels',
        CompanyAddress: '123 Main Street, Dhaka, Bangladesh',
        ContactNo: '+1234567890',
        CompanyEmail: 'support@gamil.com'
    },
    TicketingDetails: {
        RefNo: 'BK123456789',
        TicketingDate: '2024-09-01T12:30:00Z',
        ConfirmationNo: 'ABCD1234',
        ReservationNo: 'PNR5678'
    },
    Paxlist: [
        {
            PassengerName: 'John Doe',
            PaxType: 'ADT',
            PassportNo: 'M12345678',
            TicketNo: 'ET1234567890'
        },
        {
            PassengerName: 'Emily Dickenson',
            PaxType: 'CHD',
            PassportNo: 'M87654321',
            TicketNo: 'ET0987654321'
        }
    ],
    TravelDetials: {
        OnwardSegmentList: [
            {
                OriginName: 'DAC',
                DestinationName: 'DXB',
                CarrierName: 'Emirates',
                CarrierCode: 'EK',
                FlightNumber: '585',
                DepartureDate: '2024-09-10T07:00:00Z',
                ArrivalDate: '2024-09-10T10:45:00Z',
                OriginAirPortName: 'Hazrat Shahjalal International Airport,Dhaka,Bangladesh',
                OriginTerminal: 'Terminal 1',
                ArrivalAirPortName: 'Dubai International Airport,Dubai,UAE',
                ArrivalTerminal: 'Terminal 3',
                TravelTime: '5h 45m',
                AirCraft: 'Boeing 777',
                CabinClassType: 'Economy',
                Meals: 'Meal included',
                CabinClass: 'K',

                CabinBaggage: '7',
                BaggageInfos: [
                    {
                        Baggage: '30KG',
                        NumberOfPieces: 0,
                        PaxType: 'ADT'
                    },
                    {
                        Baggage: '30KG',
                        NumberOfPieces: 0,
                        PaxType: 'CNN'
                    }
                ]
            }
        ]
    },

    FareBrakeDown: {
        PaxFareBreakdown: [
            {
                PaxType: 'ADT',
                BaseFare: 500,
                Tax: 100,
                Discount: 50,
                ServiceCharge: 30,
                NoOfPax: 1,
                TotalFare: 580
            },
            {
                PaxType: 'CHD',
                BaseFare: 400,
                Tax: 80,
                Discount: 20,
                ServiceCharge: 25,
                NoOfPax: 1,
                TotalFare: 485
            }
        ],
        BaseFare: 900,
        Tax: 180,
        AIT: 50,
        Discount: 70,
        ServiceCharge: 55,
        TotalFare: 44000,
        ExtraService: 100
    },
    BaggageDetails: [
        {
            Origin: 'DAC',
            Destination: 'DXB',
            CabinBaggage: 7,
            BaggageList: [{ Baggage: '20KG' }]
        },
        {
            Origin: 'DXB',
            Destination: 'DAC',
            CabinBaggage: 7,
            BaggageList: [{ Baggage: '20KG' }]
        }
    ]
};
