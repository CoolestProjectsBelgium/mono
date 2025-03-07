import { Command, Positional, Option } from 'nestjs-command';
import { Injectable } from '@nestjs/common';
//import { RegistrationService } from '../registration/registration.service';
import { EventService } from '../event/event.service';
import { Event } from '../models/event.model'; // Adjust the path based on your project structure
import { Tshirt } from 'src/models/tshirt.model';
import { TshirtGroup } from 'src/models/tshirt_group.model';
import { TshirtGroupTranslation } from 'src/models/tshirt_group_translation.model';
import { TshirtTranslation } from 'src/models/tshirt_translation.model';
import { Question } from 'src/models/question.model';
import { QuestionTranslation } from 'src/models/question_translation.model';
import { QuestionRegistration } from 'src/models/question_registration.model';
import { Location } from 'src/models/location.model';
import { EventTable } from 'src/models/event_table.model';
import { Registration } from 'src/models/registration.model';

@Injectable()
export class EventCommand {
  constructor(private readonly eventService: EventService) { }

  @Command({
    command: 'event:init',
    describe: 'init db',
  })
  async initEventDB() {
    const event = await Event.create({
      azure_storage_container: 'coolestproject25',
      minAge: 7,
      maxAge: 18,
      minGuardianAge: 16,
      maxRegistration: 64,
      maxVoucher: 3,
      eventBeginDate: new Date('2024-09-01T00:00:00'),
      registrationOpenDate: new Date('2024-11-01T00:00:00'),
      registrationClosedDate: new Date('2025-04-01T00:00:00'),
      projectClosedDate: new Date('2025-04-12T00:00:00'),
      officialStartDate: new Date('2025-04-26T00:00:00'),
      eventEndDate: new Date('2025-08-31T00:00:00'),
      maxFileSize: 2147483647,
      event_title: 'Coolest Projects 2025',
      createdAt: new Date('2025-01-15T19:47:29'),
      updatedAt: new Date('2025-01-16T12:16:48')
    });

    const groups = await TshirtGroup.bulkCreate([
        {
        eventId: event.id,
        name: 'kids'
      },
      {
        eventId: event.id,
        name: 'adults'
      }
    ]);
    
    const questions = await Question.bulkCreate([
      {
      eventId: event.id,
      name: 'Agree to Photo',

    },
    {
      eventId: event.id,
      name: 'Agree to Contact'
    },
    {
      eventId: event.id,
      name: 'Approved',
      mandatory: 1
    }
  ]);
  await QuestionTranslation.bulkCreate([
    {
    eventId: event.id,
    language: 'en',
    questionId:questions[0].id,
    positive: 'That is no problem',
    negative: "Don't use any pictures or movies where the participant is reconizable",
    description: 'It is possible that the participant is photographed or filmed'
  },
  {
    eventId: event.id,
    language: 'en',
    questionId:questions[1].id,
    positive: 'Yes',
    negative: 'No',
    description: 'Can CoderDojo contact you for the next edition'
  },
  {
    eventId: event.id,
    language: 'en',
    questionId:questions[2].id,
    positive: 'Yes',
    negative: 'No',
    description: 'Be sure to read our rules. Do you agree'
  },
  {
    eventId: event.id,
    language: 'nl',
    questionId:questions[0].id,
    positive: 'Dat is geen probleem',
    negative: "Gelieve geen foto’s en filmpjes te gebruiken waarop de deelnemer herkenbaar is",
    description: 'Het is mogelijk dat de deelnemer gefotografeerd of gefilmd wordt'
  },
  {
    eventId: event.id,
    language: 'nl',
    questionId:questions[1].id,
    positive: 'Yes',
    negative: 'No',
    description: 'Mag CoderDojo je contacteren voor de volgende editie?'
  },
  {
    eventId: event.id,
    language: 'nl',
    questionId:questions[2].id,
    positive: 'Yes',
    negative: 'No',
    description: 'Lees zeker onze regels. Ga je akkoord?'
  },
  {
    eventId: event.id,
    language: 'fr',
    questionId:questions[0].id,
    positive: "Je suis d'accord",
    negative: "Je ne suis pas d’accord que l’on utilise les images et vidéos si le ou la participant.e est reconnaissable",
    description: 'Le ou la participant.e peut être photographié.e ou filmé.e.'
  },
  {
    eventId: event.id,
    language: 'fr',
    questionId:questions[1].id,
    positive: 'Yes',
    negative: 'No',
    description: 'CoderDojo peut-il vous contacter pour la prochaine édition ?'
  },
  {
    eventId: event.id,
    language: 'fr',
    questionId:questions[2].id,
    positive: 'Yes',
    negative: 'No',
    description: "Assure-toi de lire nos règles. Es-tu d'accord ?"
  }]);

   await TshirtGroupTranslation.bulkCreate([
      {
        eventId: event.id,
        language: 'en',
        description: 'kids',
        groupId: groups[0].id
      },
     {
        eventId: event.id,
        language: 'en',
        description: 'adults',
        groupId: groups[1].id
      },
      {
        eventId: event.id,
        language: 'nl',
        description: 'kind',
        groupId: groups[0].id
      },
      {
        eventId: event.id,
        language: 'nl',
        description: 'volwassen  ',
        groupId: groups[1].id
      },
      {
        eventId: event.id,
        language: 'fr',
        description: 'kind',
        groupId: groups[0].id
      },
      {
        eventId: event.id,
        language: 'fr',
        description: 'adulte',
        groupId: groups[1].id
      }
  ]);

    const tshirts = await Tshirt.bulkCreate([
      {
        eventId: event.id,
        name: 'kid_3-4',
        groupId: groups[0].id
      },
      {
        eventId: event.id,
        name: 'kid_5-6',
        groupId: groups[0].id
      },
      {
        eventId: event.id,
        name: 'kid_7-8',
        groupId: groups[0].id
      },
      {
        eventId: event.id,
        name: 'kid_9-11',
        groupId: groups[0].id
      },
      {
        eventId: event.id,
        name: 'kid_12-14',
        groupId: groups[0].id
      },
      {
        eventId: event.id,
        name: 'adult_XXS',
        groupId: groups[1].id
      },
      {
        eventId: event.id,
        name: 'adult_XS',
        groupId: groups[1].id
      },
      {
        eventId: event.id,
        name: 'adult_S',
        groupId: groups[1].id
      },
      {
        eventId: event.id,
        name: 'adult_M',
        groupId: groups[1].id
      },
      {
        eventId: event.id,
        name: 'adult_L',
        groupId: groups[1].id
      },
      {
        eventId: event.id,
        name: 'adult_XL',
        groupId: groups[1].id
      },
      {
        eventId: event.id,
        name: 'adult_XXL',
        groupId: groups[1].id
      },
      {
        eventId: event.id,
        name: 'adult_3XL',
        groupId: groups[1].id
      },
      {
        eventId: event.id,
        name: 'adult_4XL',
        groupId: groups[1].id
      },
      {
        eventId: event.id,
        name: 'adult_5XL',
        groupId: groups[1].id
      }
    ]);

    await TshirtTranslation.bulkCreate([
      {
        eventId: event.id,
        language: 'en',
        description: 'kid_3-4',
        tshirtId: tshirts[0].id
      },
      {
        eventId: event.id,
        language: 'en',
        description:  'kid_5-6',
        tshirtId: tshirts[1].id
      },
      {
        eventId: event.id,
        language: 'en',
        description:  'kid_7-8',
        tshirtId: tshirts[2].id
      },
      {
        eventId: event.id,
        language: 'en',
        description:  'kid_9-11',
        tshirtId: tshirts[3].id
      },
      {
        eventId: event.id,
        language: 'en',
        description:  'kid_12-14',
        tshirtId: tshirts[4].id
      },
      {
        eventId: event.id,
        language: 'en',
        description:  'adult_XXS',
        tshirtId: tshirts[5].id
      },
      {
        eventId: event.id,
        language: 'en',
        description:  'adult_XS',
        tshirtId: tshirts[6].id
      },
      {

        eventId: event.id,
        language: 'en',
        description:  'adult_S',
        tshirtId: tshirts[7].id
      },
      {
        eventId: event.id,
        language: 'en',
        description:  'adult_M',
        tshirtId: tshirts[8].id
      },
      {
        eventId: event.id,
        language: 'en',
        description:  'adult_L',
        tshirtId: tshirts[9].id
      },
      {
        eventId: event.id,
        language: 'en',
        description:  'adult_XL',
        tshirtId: tshirts[10].id
      },
      {
        eventId: event.id,
        language: 'en',
        description:  'adult_XXL',
        tshirtId: tshirts[11].id
      },
      {
        eventId: event.id,
        language: 'en',
        description:  'adult_3XL',
        tshirtId: tshirts[12].id
      },
      {
        eventId: event.id,
        language: 'en',
        description:  'adult_4XL',
        tshirtId: tshirts[13].id
      },
      {
        eventId: event.id,
        language: 'en',
        description:  'adult_5XL',
        tshirtId: tshirts[14].id
      },

      {
        eventId: event.id,
        language: 'nl',
        description: 'kid_3-4',
        tshirtId: tshirts[0].id
      },
      {
        eventId: event.id,
        language: 'nl',
        description:  'kid_5-6',
        tshirtId: tshirts[1].id
      },
      {
        eventId: event.id,
        language: 'nl',
        description:  'kid_7-8',
        tshirtId: tshirts[2].id
      },
      {
        eventId: event.id,
        language: 'nl',
        description:  'kid_9-11',
        tshirtId: tshirts[3].id
      },
      {
        eventId: event.id,
        language: 'nl',
        description:  'kid_12-14',
        tshirtId: tshirts[4].id
      },
      {
        eventId: event.id,
        language: 'nl',
        description:  'adult_XXS',
        tshirtId: tshirts[5].id
      },
      {
        eventId: event.id,
        language: 'nl',
        description:  'adult_XS',
        tshirtId: tshirts[6].id
      },
      {
        eventId: event.id,
        language: 'nl',
        description:  'adult_S',
        tshirtId: tshirts[7].id
      },
      {
        eventId: event.id,
        language: 'nl',
        description:  'adult_M',
        tshirtId: tshirts[8].id
      },
      {
        eventId: event.id,
        language: 'nl',
        description:  'adult_L',
        tshirtId: tshirts[9].id
      },
      {
        eventId: event.id,
        language: 'nl',
        description:  'adult_XL',
        tshirtId: tshirts[10].id
      },
      {
        eventId: event.id,
        language: 'nl',
        description:  'adult_XXL',
        tshirtId: tshirts[11].id
      },
      {
        eventId: event.id,
        language: 'nl',
        description:  'adult_3XL',
        tshirtId: tshirts[12].id
      },
      {
        eventId: event.id,
        language: 'nl',
        description:  'adult_4XL',
        tshirtId: tshirts[13].id
      },
      {
        eventId: event.id,
        language: 'nl',
        description:  'adult_5XL',
        tshirtId: tshirts[14].id
      },

      {
        eventId: event.id,
        language: 'fr',
        description: 'kid_3-4',
        tshirtId: tshirts[0].id
      },
      {
        eventId: event.id,
        language: 'fr',
        description:  'kid_5-6',
        tshirtId: tshirts[1].id
      },
      {
        eventId: event.id,
        language: 'fr',
        description:  'kid_7-8',
        tshirtId: tshirts[2].id
      },
      {
        eventId: event.id,
        language: 'fr',
        description:  'kid_9-11',
        tshirtId: tshirts[3].id
      },
      {
        eventId: event.id,
        language: 'fr',
        description:  'kid_12-14',
        tshirtId: tshirts[4].id
      },
      {
        eventId: event.id,
        language: 'fr',
        description:  'adult_XXS',
        tshirtId: tshirts[5].id
      },
      {
        eventId: event.id,
        language: 'fr',
        description:  'adult_XS',
        tshirtId: tshirts[6].id
      },
      {
        eventId: event.id,
        language: 'fr',
        description:  'adult_S',
        tshirtId: tshirts[7].id
      },
      {
        eventId: event.id,
        language: 'fr',
        description:  'adult_M',
        tshirtId: tshirts[8].id
      },
      {
        eventId: event.id,
        language: 'fr',
        description:  'adult_L',
        tshirtId: tshirts[9].id
      },
      {
        eventId: event.id,
        language: 'fr',
        description:  'adult_XL',
        tshirtId: tshirts[10].id
      },
      {
        eventId: event.id,
        language: 'fr',
        description:  'adult_XXL',
        tshirtId: tshirts[11].id
      },
      {
        eventId: event.id,
        language: 'fr',
        description:  'adult_3XL',
        tshirtId: tshirts[12].id
      },
      {
        eventId: event.id,
        language: 'fr',
        description:  'adult_4XL',
        tshirtId: tshirts[13].id
      },
      {
        eventId: event.id,
        language: 'fr',
        description:  'adult_5XL',
        tshirtId: tshirts[14].id
      }
    ]);
    
    const location = await Location.bulkCreate([
      {
        eventId: event.id,
        text: 'Column 1'
      },
      {
        eventId: event.id,
        text: 'Column 2'
      },
      {
        eventId: event.id,
        text: 'Column 3'
      },
      {
        eventId: event.id,
        text: 'Column 4'
      },
      {
        eventId: event.id,
        text: 'Column 5'
      },
      {
        eventId: event.id,
        text: 'Column 6'
      }
    ]);
    await EventTable.bulkCreate([
      {
        eventId: event.id,
        name: 'Tafel_01',
        requirements: null,
        maxPlaces: 4,
        locationId: location[0].id
      },
      {
        eventId: event.id,
        name: 'Tafel_02',
        requirements: null,
        maxPlaces: 4,
        locationId: location[1].id
      },
      {
        eventId: event.id,
        name: 'Tafel_03',
        requirements: null,
        maxPlaces: 4,
        locationId: location[2].id
      },
      {
        eventId: event.id,
        name: 'Tafel_04',
        requirements: null,
        maxPlaces: 4,
        locationId: location[3].id
      },
      {
        eventId: event.id,
        name: 'Tafel_05',
        requirements: null,
        maxPlaces: 4,
        locationId: location[4].id
      },     
      {
        eventId: event.id,
        name: 'Tafel_06',
        requirements: null,
        maxPlaces: 4,
        locationId: location[5].id
      },
      {
        eventId: event.id,
        name: 'Tafel_07',
        requirements: null,
        maxPlaces: 4,
        locationId: location[0].id
      },
      {
        eventId: event.id,
        name: 'Tafel_08',
        requirements: null,
        maxPlaces: 4,
        locationId: location[1].id
      },
      {
        eventId: event.id,
        name: 'Tafel_09',
        requirements: null,
        maxPlaces: 4,
        locationId: location[2].id
      },
      {
        eventId: event.id,
        name: 'Tafel_10',
        requirements: null,
        maxPlaces: 4,
        locationId: location[3].id
      },
      {
        eventId: event.id,
        name: 'Tafel_11',
        requirements: null,
        maxPlaces: 4,
        locationId: location[4].id
      },     
      {
        eventId: event.id,
        name: 'Tafel_12',
        requirements: null,
        maxPlaces: 4,
        locationId: location[5].id
      },
      {
        eventId: event.id,
        name: 'Tafel_13',
        requirements: null,
        maxPlaces: 4,
        locationId: location[0].id
      },
      {
        eventId: event.id,
        name: 'Tafel_14',
        requirements: null,
        maxPlaces: 4,
        locationId: location[1].id
      },
      {
        eventId: event.id,
        name: 'Tafel_15',
        requirements: null,
        maxPlaces: 4,
        locationId: location[2].id
      },
      {
        eventId: event.id,
        name: 'Tafel_16',
        requirements: null,
        maxPlaces: 4,
        locationId: location[3].id
      },
      {
        eventId: event.id,
        name: 'Tafel_17',
        requirements: null,
        maxPlaces: 4,
        locationId: location[4].id
      },     
      {
        eventId: event.id,
        name: 'Tafel_18',
        requirements: null,
        maxPlaces: 4,
        locationId: location[5].id
      },
      {
        eventId: event.id,
        name: 'Tafel_19',
        requirements: null,
        maxPlaces: 4,
        locationId: location[0].id
      },
      {
        eventId: event.id,
        name: 'Tafel_20',
        requirements: null,
        maxPlaces: 4,
        locationId: location[1].id
      },
      {
        eventId: event.id,
        name: 'Tafel_21',
        requirements: null,
        maxPlaces: 4,
        locationId: location[2].id
      },
      {
        eventId: event.id,
        name: 'Tafel_22',
        requirements: null,
        maxPlaces: 4,
        locationId: location[3].id
      },
      {
        eventId: event.id,
        name: 'Tafel_23',
        requirements: null,
        maxPlaces: 4,
        locationId: location[4].id
      },     
      {
        eventId: event.id,
        name: 'Tafel_24',
        requirements: null,
        maxPlaces: 4,
        locationId: location[5].id
      },
      {
        eventId: event.id,
        name: 'Tafel_25',
        requirements: null,
        maxPlaces: 4,
        locationId: location[0].id
      },
      {
        eventId: event.id,
        name: 'Tafel_26',
        requirements: null,
        maxPlaces: 4,
        locationId: location[1].id
      },
      {
        eventId: event.id,
        name: 'Tafel_27',
        requirements: null,
        maxPlaces: 4,
        locationId: location[2].id
      },
      {
        eventId: event.id,
        name: 'Tafel_28',
        requirements: null,
        maxPlaces: 4,
        locationId: location[3].id
      },
      {
        eventId: event.id,
        name: 'Tafel_29',
        requirements: null,
        maxPlaces: 4,
        locationId: location[4].id
      },     
      {
        eventId: event.id,
        name: 'Tafel_30',
        requirements: null,
        maxPlaces: 4,
        locationId: location[5].id
      },
      {
        eventId: event.id,
        name: 'Tafel_31',
        requirements: null,
        maxPlaces: 4,
        locationId: location[0].id
      },
      {
        eventId: event.id,
        name: 'Tafel_32',
        requirements: null,
        maxPlaces: 4,
        locationId: location[1].id
      },
      {
        eventId: event.id,
        name: 'Tafel_33',
        requirements: null,
        maxPlaces: 4,
        locationId: location[2].id
      },
      {
        eventId: event.id,
        name: 'Tafel_34',
        requirements: null,
        maxPlaces: 4,
        locationId: location[3].id
      },
      {
        eventId: event.id,
        name: 'Tafel_35',
        requirements: null,
        maxPlaces: 4,
        locationId: location[4].id
      },     
      {
        eventId: event.id,
        name: 'Tafel_36',
        requirements: null,
        maxPlaces: 4,
        locationId: location[5].id
      }
     ]);
     const registration = await Registration.bulkCreate([
      {
        eventId: event.id,
        tshirtId: 1,
        questions: questions[1],
        language: 'nl',
        postalcode: 9111,
        municipality_name: null,
        street: null,
        box_number: null,
        email: 'randomemail@example.com',
        firstname: 'John',
        lastname: 'Doe',
        sex: 'm',
        birthmonth: new Date('2015-01-01'),
        via: 'friend',
        medical: 'none',
        gsm: '1234567890',
        gsm_guardian: '0987654321',
        internalinfo: 'No internal info',
        email_guardian: 'guardian@example.com',
        project_code: 'abc123',
        waiting_list: false,
        project_name: 'Cool Project',
        project_descr: 'This is a cool project',
        project_lang: 'en',
        project_type: 'science',
        max_tokens: 3
      },
      {
      eventId: event.id,
      tshirtId: 15,
      questions: questions[1],
      language: 'nl',
      postalcode: 9111,
      municipality_name: null,
      street: null,
      box_number: null,
      email: 'hallo@webenzo.be',
      firstname: 'John',
      lastname: 'DoeDoe',
      sex: 'm',
      birthmonth: new Date('2009-01-01'),
      via: 'friend van een vriend',
      medical: 'none',
      gsm: '1234567890',
      gsm_guardian: '0987654321',
      internalinfo: 'No internal info',
      email_guardian: 'hallo@webenzo.be',
      project_code: 'be6aa4ef9b1a19a94eeecf2ee18f7e629119',
      waiting_list: false,
      project_name: null,
      project_descr: null,
      project_lang: 'nl',
      project_type: null,
      max_tokens: 0
    }
    ]);    
    const questionsRegistration = await QuestionRegistration.bulkCreate([
      {
      eventId: event.id,
      registrationId: registration[0].id,
      questionId: questions[0].id
    },
    {
      eventId: event.id,
      registrationId: registration[0].id,
      questionId: questions[1].id
    },
    {
      eventId: event.id,
      registrationId: registration[0].id,
      questionId: questions[2].id
    },
    {
      eventId: event.id,
      registrationId: registration[1].id,
      questionId: questions[0].id
    },
    {
      eventId: event.id,
      registrationId: registration[1].id,
      questionId: questions[1].id
    },
    {
      eventId: event.id,
      registrationId: registration[1].id,
      questionId: questions[2].id
    }
  ]);

    /*
    const eventTables = [
      { name: 'Table 1', capacity: 10 },
      { name: 'Table 2', capacity: 8 },
      { name: 'Table 3', capacity: 12 },
    ];

    for (const table of eventTables) {
      await EventTable.create({
        eventId: event.id,
        name: table.name,
        capacity: table.capacity,
      });
    }*/
  }
  @Command({
    command: 'event:create',
    describe: 'create new event',
  })
  async createEvent(
    @Option({
      name: 'azureStorageContainer',
      type: 'string',
      default: 'testcontainer',
    })
    azureStorageContainer: string,

    @Option({
      name: 'minAge',
      type: 'number',
      default: '8',
    })
    minAge: number,

    @Option({
      name: 'maxAge',
      type: 'number',
      default: '8',
    })
    maxAge: number,

    @Option({
      name: 'minGuardianAge',
      type: 'number',
      default: '8',
    })
    minGuardianAge: number,

    @Option({
      name: 'maxRegistration',
      type: 'number',
      default: '8',
    })
    maxRegistration: number,

    @Option({
      name: 'maxVoucher',
      type: 'number',
      default: '8',
    })
    maxVoucher: number,

    @Option({
      name: 'eventBeginDate',
      type: 'string',
      default: new Date(),
    })
    eventBeginDate: string,

    @Option({
      name: 'registrationOpenDate',
      type: 'string',
      default: new Date(),
    })
    registrationOpenDate: string,

    @Option({
      name: 'registrationClosedDate',
      type: 'string',
      default: new Date(),
    })
    registrationClosedDate: string,

    @Option({
      name: 'projectClosedDate',
      type: 'string',
      default: new Date(),
    })
    projectClosedDate: string,

    @Option({
      name: 'projectClosedDate',
      type: 'string',
      default: new Date(),
    })
    officialStartDate: string,

    @Option({
      name: 'eventEndDate',
      type: 'string',
      default: new Date(),
    })
    eventEndDate: string,

    @Option({
      name: 'maxFileSize',
      type: 'number',
      default: '4711',
    })
    maxFileSize: number,

    @Option({
      name: 'eventTitle',
      type: 'string',
      default: 'Coolest Projects XX',
    })
    eventTitle: string,
  ) {
    const event = await this.eventService.create({
      azureStorageContainer,
      minAge,
      maxAge,
      minGuardianAge,
      maxRegistration,
      maxVoucher,
      eventBeginDate: new Date(eventBeginDate),
      registrationOpenDate: new Date(registrationOpenDate),
      registrationClosedDate: new Date(registrationClosedDate),
      projectClosedDate: new Date(projectClosedDate),
      officialStartDate: new Date(officialStartDate),
      eventEndDate: new Date(eventEndDate),
      maxFileSize,
      event_title: eventTitle
    });
    console.log('Event created %d', event.id, event);
  }

  @Command({
    command: 'event:close',
    describe: 'close event',
  })
  async closeEvent() {
    console.log('Close event');
  }


}