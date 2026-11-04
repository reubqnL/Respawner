// code dump from https://github.com/ini-commits/projectt

import {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    PermissionFlagsBits,
    ChannelType,
} from 'discord.js';

const registeredClients = new WeakSet();

export const data = new SlashCommandBuilder()
    .setName('setup-tickets')
    .setDescription('Creates the support ticket panel.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction) {
    const embed = new EmbedBuilder()
        .setTitle('🎫 Support & Review Tickets')
        .setDescription(
            'Need help or want to submit a review request to Respawn Sync? Click below to open a private ticket thread with our staff.'
        )
        .setColor('#5865F2')
        .setFooter({ text: 'Respawn Sync Community Tooling' });

    const button = new ButtonBuilder()
        .setCustomId('create_ticket_btn')
        .setLabel('Create Ticket')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('📩');

    await interaction.reply({
        embeds: [embed],
        components: [new ActionRowBuilder().addComponents(button)],
    });
}

// Call once after creating the bot client to connect ticket buttons to it.
export function registerTicketHandlers(client) {
    if (registeredClients.has(client)) return;

    registeredClients.add(client);
    client.on('interactionCreate', async (interaction) => {
        if (!interaction.isButton()) return;

        try {
            await handleTicketButton(interaction);
        } catch (error) {
            console.error('Failed to handle ticket button:', error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: 'Something went wrong. Please contact an administrator.',
                    ephemeral: true,
                });
            }
        }
    });
}

async function handleTicketButton(interaction) {
    if (interaction.customId === 'create_ticket_btn') {
        await interaction.deferReply({ ephemeral: true });

        const channel = interaction.channel;
        if (!channel || channel.type !== ChannelType.GuildText) {
            await interaction.editReply({
                content: 'Tickets can only be opened from a server text channel.',
            });
            return;
        }

        const user = interaction.user;

        try {
            const thread = await channel.threads.create({
                name: `ticket-${user.username}`.slice(0, 100),
                autoArchiveDuration: 60,
                type: ChannelType.PrivateThread,
                reason: `Support ticket opened by ${user.tag}`,
            });

            await thread.members.add(user.id);

            const ticketEmbed = new EmbedBuilder()
                .setTitle('🎟️ Ticket Opened')
                .setDescription(
                    `Hello ${user}, thanks for reaching out. Staff will be with you shortly.\n\nUse the button below to close this ticket when you're finished.`
                )
                .setColor('#2F3136');

            const closeButton = new ButtonBuilder()
                .setCustomId('close_ticket_btn')
                .setLabel('Close Ticket')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('🔒');

            await thread.send({
                embeds: [ticketEmbed],
                components: [new ActionRowBuilder().addComponents(closeButton)],
            });

            await interaction.editReply({
                content: `Your ticket is ready. Head over to ${thread} to chat with staff.`,
            });
        } catch (error) {
            console.error('Failed to create ticket thread:', error);
            await interaction.editReply({
                content:
                    'Something went wrong while creating your ticket. Please contact an administrator.',
            });
        }

        return;
    }

    if (interaction.customId !== 'close_ticket_btn') return;

    const thread = interaction.channel;
    if (!thread?.isThread()) {
        await interaction.reply({
            content: 'This ticket can only be closed from inside the thread.',
            ephemeral: true,
        });
        return;
    }

    await interaction.reply({ content: 'Closing this ticket...', ephemeral: true });
    await thread.setLocked(true);
    await thread.setArchived(true);
}

// great work Ini, I will put this in the main project now